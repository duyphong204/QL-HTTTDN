import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePromotionDto,
  SetPromotionProductsDto,
  UpdatePromotionDto,
} from './dto/promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  private validatePromotionPayload(payload: {
    type?: 'PERCENT' | 'FIXED';
    value?: number;
    startAt?: Date;
    endAt?: Date;
  }) {
    if (
      payload.type === 'PERCENT' &&
      typeof payload.value === 'number' &&
      payload.value > 100
    ) {
      throw new BadRequestException(
        'Khuyen mai theo % khong duoc vuot qua 100',
      );
    }

    if (payload.startAt && payload.endAt && payload.startAt > payload.endAt) {
      throw new BadRequestException(
        'Thoi gian bat dau khong duoc lon hon thoi gian ket thuc',
      );
    }
  }

  private async ensureProductsExist(productIds: string[]) {
    if (!productIds.length) {
      return;
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Danh sach san pham co phan tu khong ton tai',
      );
    }
  }

  async findAll() {
    return this.prisma.promotion.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreatePromotionDto) {
    this.validatePromotionPayload(dto);
    await this.ensureProductsExist(dto.productIds ?? []);

    return this.prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          name: dto.name,
          type: dto.type,
          value: dto.value,
          startAt: dto.startAt,
          endAt: dto.endAt,
          isActive: dto.isActive ?? true,
        },
      });

      if (dto.productIds?.length) {
        await tx.promotionProduct.deleteMany({
          where: {
            productId: {
              in: dto.productIds,
            },
          },
        });

        await tx.promotionProduct.createMany({
          data: dto.productIds.map((productId) => ({
            promotionId: promotion.id,
            productId,
          })),
        });
      }

      return tx.promotion.findUnique({
        where: { id: promotion.id },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stockQuantity: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async update(id: string, dto: UpdatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Khong tim thay chuong trinh khuyen mai');
    }

    this.validatePromotionPayload({
      type: dto.type ?? existing.type,
      value: dto.value ?? existing.value,
      startAt: dto.startAt ?? existing.startAt ?? undefined,
      endAt: dto.endAt ?? existing.endAt ?? undefined,
    });

    return this.prisma.promotion.update({
      where: { id },
      data: dto,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });
  }

  async setProducts(id: string, dto: SetPromotionProductsDto) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Khong tim thay chuong trinh khuyen mai');
    }

    await this.ensureProductsExist(dto.productIds);

    return this.prisma.$transaction(async (tx) => {
      await tx.promotionProduct.deleteMany({ where: { promotionId: id } });

      if (dto.productIds.length) {
        await tx.promotionProduct.deleteMany({
          where: {
            productId: {
              in: dto.productIds,
            },
          },
        });

        await tx.promotionProduct.createMany({
          data: dto.productIds.map((productId) => ({
            promotionId: id,
            productId,
          })),
        });
      }

      return tx.promotion.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stockQuantity: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Khong tim thay chuong trinh khuyen mai');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.promotionProduct.deleteMany({ where: { promotionId: id } });
      return tx.promotion.delete({ where: { id } });
    });
  }
}
