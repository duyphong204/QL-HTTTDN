import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, type Cart, type CartItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { enrichProductPricing } from 'src/common/utils/pricing.helper';
import {
  CartItemInputDto,
  SyncCartDto,
  UpdateCartItemDto,
} from './dto/cart.dto';

type CartItemProduct = ReturnType<typeof enrichProductPricing>;

export interface CartResponseItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: CartItemProduct;
}

export interface CartResponse {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartResponseItem[];
}

const productInclude = {
  category: true,
  supplier: true,
  promotionLinks: {
    include: {
      promotion: true,
    },
  },
} as const;

const cartItemProductArgs: Prisma.ProductDefaultArgs = {
  include: productInclude,
};

type CartWithItems = Cart & {
  items: (CartItem & {
    product: Prisma.ProductGetPayload<{ include: typeof productInclude }>;
  })[];
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadCart(
    userId: string,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<CartWithItems> {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: cartItemProductArgs,
          },
        },
      },
    });

    if (cart) {
      return cart as CartWithItems;
    }

    await tx.cart.create({
      data: { userId },
    });

    const created = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: cartItemProductArgs,
          },
        },
      },
    });

    if (!created) {
      throw new BadRequestException('Không thể tạo giỏ hàng');
    }

    return created as CartWithItems;
  }

  private mapCart(cart: CartWithItems): CartResponse {
    return {
      id: cart.id,
      userId: cart.userId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items
        .filter((item) => !!item.product)
        .map((item) => ({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          quantity: item.quantity,
          product: enrichProductPricing(item.product),
        })),
    };
  }

  private async validateAvailableQuantity(
    tx: Prisma.TransactionClient | PrismaService,
    productId: string,
    quantity: number,
    existingQuantity = 0,
  ) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: productInclude,
    });

    if (!product || product.deletedAt) {
      throw new BadRequestException({
        code: 'PRODUCT_NOT_FOUND',
        productId,
        message: `Sản phẩm ${productId} không tồn tại`,
      });
    }

    const totalQuantity = existingQuantity + quantity;
    if (totalQuantity <= 0) {
      throw new BadRequestException('Số lượng sản phẩm không hợp lệ');
    }

    if (product.stockQuantity < totalQuantity) {
      throw new BadRequestException({
        code: 'PRODUCT_OUT_OF_STOCK',
        productId,
        message: `Sản phẩm ${product.name} không đủ tồn kho`,
      });
    }

    return product;
  }

  private async upsertItem(
    tx: Prisma.TransactionClient | PrismaService,
    cartId: string,
    productId: string,
    quantity: number,
  ) {
    const existing = await tx.cartItem.findFirst({
      where: { cartId, productId },
    });

    const nextQuantity = existing ? existing.quantity + quantity : quantity;

    await this.validateAvailableQuantity(
      tx,
      productId,
      quantity,
      existing?.quantity ?? 0,
    );

    if (existing) {
      return tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
    }

    return tx.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  async getCart(userId: string) {
    const cart = await this.loadCart(userId);
    return this.mapCart(cart);
  }

  async addItem(userId: string, dto: CartItemInputDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.loadCart(userId, tx);
      await this.upsertItem(tx, cart.id, dto.productId, dto.quantity);
      return this.mapCart(await this.loadCart(userId, tx));
    });
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.loadCart(userId, tx);
      const existing = await tx.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      if (!existing) {
        throw new BadRequestException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      if (dto.quantity <= 0) {
        await tx.cartItem.delete({ where: { id: existing.id } });
        return this.mapCart(await this.loadCart(userId, tx));
      }

      await this.validateAvailableQuantity(tx, productId, dto.quantity);

      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: dto.quantity },
      });

      return this.mapCart(await this.loadCart(userId, tx));
    });
  }

  async removeItem(userId: string, productId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.loadCart(userId, tx);

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });

      return this.mapCart(await this.loadCart(userId, tx));
    });
  }

  async clearCart(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.loadCart(userId, tx);

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return this.mapCart(await this.loadCart(userId, tx));
    });
  }

  async syncCart(userId: string, dto: SyncCartDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.loadCart(userId, tx);

      const merged = new Map<string, number>();
      for (const item of dto.items ?? []) {
        merged.set(
          item.productId,
          (merged.get(item.productId) ?? 0) + item.quantity,
        );
      }

      for (const [productId, quantity] of merged.entries()) {
        await this.upsertItem(tx, cart.id, productId, quantity);
      }

      return this.mapCart(await this.loadCart(userId, tx));
    });
  }
}
