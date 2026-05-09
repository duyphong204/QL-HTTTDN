import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStockOutDto } from './dto/create-stock-out.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, StockOutStatus } from '@prisma/client';
import { FindStockOutQueryDto } from './dto/find-stock-out-query.dto';
import { UpdateStockOutDto } from './dto/update-stock-out.dto';

@Injectable()
export class StockOutService {
  constructor(private readonly prisma: PrismaService) {}

  private async decrementInventory(
    tx: Prisma.TransactionClient,
    items: { productId: string; quantity: number }[],
  ): Promise<Map<string, number>> {
    const costPriceMap = new Map<string, number>();
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${product?.name || item.productId} không đủ tồn kho`,
        );
      }
      costPriceMap.set(item.productId, product.costPrice);

      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }
    return costPriceMap;
  }

  private async incrementInventory(
    tx: Prisma.TransactionClient,
    items: { productId: string; quantity: number }[],
  ) {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }
  }

  private async snapshotCostPrices(
    tx: Prisma.TransactionClient,
    items: { productId: string; quantity: number }[],
  ): Promise<Map<string, number>> {
    const costPriceMap = new Map<string, number>();
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new BadRequestException(
          `Sản phẩm ${item.productId} không tồn tại`,
        );
      }
      costPriceMap.set(item.productId, product.costPrice);
    }
    return costPriceMap;
  }

  async create(dto: CreateStockOutDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Nếu phiếu xuất liên kết với một Order → Order đã trừ tồn kho (COD hoặc MoMo IPN).
      // StockOut chỉ là tài liệu kho/audit, không trừ lại.
      // Nếu KHÔNG có orderId (xuất thủ công) → StockOut tự trừ tồn kho.
      const costPriceMap = dto.orderId
        ? await this.snapshotCostPrices(tx, dto.items)
        : await this.decrementInventory(tx, dto.items);

      const totalAmount = dto.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      return tx.stockOut.create({
        data: {
          type: dto.type,
          orderId: dto.orderId,
          createdById: userId,
          totalAmount,
          status: StockOutStatus.COMPLETED,
          details: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              costPrice: costPriceMap.get(item.productId) ?? 0,
            })),
          },
        },
        include: {
          details: { include: { product: true } },
          order: true,
        },
      });
    });
  }

  async findOne(id: string) {
    const stockOut = await this.prisma.stockOut.findUnique({
      where: { id },
      include: {
        details: { include: { product: true } },
        order: true,
      },
    });

    if (!stockOut) {
      throw new NotFoundException('Không tìm thấy phiếu xuất kho');
    }

    return stockOut;
  }

  async update(id: string, dto: UpdateStockOutDto) {
    return this.prisma.$transaction(async (tx) => {
      const stockOut = await tx.stockOut.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!stockOut) {
        throw new NotFoundException('Không tìm thấy phiếu xuất kho');
      }

      if (stockOut.status === StockOutStatus.CANCELLED) {
        throw new BadRequestException('Không thể sửa phiếu xuất kho đã bị hủy');
      }

      const nextItems =
        dto.items ??
        stockOut.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));

      let costPriceMap: Map<string, number>;
      if (stockOut.orderId) {
        // Order-linked: Order quản lý tồn kho, chỉ snapshot giá vốn mới
        costPriceMap = await this.snapshotCostPrices(tx, nextItems);
      } else {
        // Manual export: hoàn kho cũ, trừ kho mới
        await this.incrementInventory(
          tx,
          stockOut.details.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        );
        costPriceMap = await this.decrementInventory(tx, nextItems);
      }

      const totalAmount = nextItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      await tx.stockOutDetail.deleteMany({ where: { stockOutId: id } });

      return tx.stockOut.update({
        where: { id },
        data: {
          type: dto.type ?? stockOut.type,
          orderId: dto.orderId ?? stockOut.orderId,
          totalAmount,
          status: StockOutStatus.COMPLETED,
          details: {
            create: nextItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              costPrice: costPriceMap.get(item.productId) ?? 0,
            })),
          },
        },
        include: {
          details: { include: { product: true } },
          order: true,
        },
      });
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const stockOut = await tx.stockOut.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!stockOut) {
        throw new NotFoundException('Không tìm thấy phiếu xuất kho');
      }

      if (stockOut.status === StockOutStatus.CANCELLED) {
        throw new BadRequestException('Phiếu xuất kho đã bị hủy trước đó');
      }

      // Order-linked: Order quản lý tồn kho, không cần hoàn kho ở đây.
      // Tồn kho sẽ được hoàn khi Order bị huỷ (cancelOrder).
      // Manual export: hoàn lại tồn kho vì không có Order nào xử lý.
      if (!stockOut.orderId) {
        await this.incrementInventory(
          tx,
          stockOut.details.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        );
      }

      // Soft-cancel: giữ record cho lịch sử, không hard-delete
      return tx.stockOut.update({
        where: { id },
        data: { status: StockOutStatus.CANCELLED },
        include: {
          details: { include: { product: true } },
          order: true,
        },
      });
    });
  }

  async findAll(query: FindStockOutQueryDto) {
    const { status, type, fromDate, toDate } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.StockOutWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate && { gte: new Date(fromDate) }),
              ...(toDate && { lte: new Date(toDate) }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.stockOut.findMany({
        where,
        skip,
        take: limit,
        include: {
          details: { include: { product: true } },
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockOut.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
