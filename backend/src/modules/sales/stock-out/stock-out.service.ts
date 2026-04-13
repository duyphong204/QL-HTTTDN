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
  ) {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${product?.name || item.productId} không đủ tồn kho`,
        );
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }
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

  async create(dto: CreateStockOutDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.decrementInventory(tx, dto.items);

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

      await this.incrementInventory(
        tx,
        stockOut.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      const nextItems = dto.items ??
        stockOut.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));

      await this.decrementInventory(tx, nextItems);

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

      await this.incrementInventory(
        tx,
        stockOut.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      await tx.stockOutDetail.deleteMany({ where: { stockOutId: id } });
      return tx.stockOut.delete({ where: { id } });
    });
  }

  async findAll(query: FindStockOutQueryDto) {
    const { status, type, fromDate, toDate } = query;

    return await this.prisma.stockOut.findMany({
      where: {
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
      },
      include: {
        details: { include: { product: true } },
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
