import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockInDto, UpdateStockInDto } from './dto/stock-in.dto';
import { Prisma } from '@prisma/client';
import { StockInStatus } from '@prisma/client';
@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) {}

  private async applyStockIn(
    tx: Prisma.TransactionClient,
    items: { productId: string; quantity: number; price: number }[],
  ) {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại`);
      }

      const totalQuantity = product.stockQuantity + item.quantity;
      const newCostPrice =
        totalQuantity > 0
          ? (product.stockQuantity * product.costPrice + item.quantity * item.price) /
            totalQuantity
          : item.price;

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { increment: item.quantity },
          costPrice: newCostPrice,
        },
      });
    }
  }

  private async revertStockIn(
    tx: Prisma.TransactionClient,
    items: { productId: string; quantity: number }[],
  ) {
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stockQuantity < item.quantity) {
        throw new NotFoundException(`Không thể hoàn tác tồn kho cho ${item.productId}`);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
        },
      });
    }
  }

  async createStockIn(dto: CreateStockInDto, userId: string) {
    const { supplierId, details } = dto;

    return this.prisma.$transaction(async (tx) => {
      await this.applyStockIn(tx, details);

      const totalAmount = details.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      return tx.stockIn.create({
        data: {
          supplierId,
          totalAmount,
          createdById: userId,
          status: StockInStatus.COMPLETED,
          details: {
            create: details.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { supplier: true, details: { include: { product: true } } },
      });
    });
  }

  async updateStockIn(id: string, dto: UpdateStockInDto) {
    return this.prisma.$transaction(async (tx) => {
      const stockIn = await tx.stockIn.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!stockIn) throw new NotFoundException('Phiếu nhập không tồn tại');

      await this.revertStockIn(
        tx,
        stockIn.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      const nextDetails = dto.details ??
        stockIn.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }));

      await this.applyStockIn(tx, nextDetails);

      const totalAmount = nextDetails.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      await tx.stockInDetail.deleteMany({ where: { stockInId: id } });

      return tx.stockIn.update({
        where: { id },
        data: {
          supplierId: dto.supplierId ?? stockIn.supplierId,
          totalAmount,
          status: StockInStatus.COMPLETED,
          details: {
            create: nextDetails.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { supplier: true, details: { include: { product: true } } },
      });
    });
  }

  async removeStockIn(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const stockIn = await tx.stockIn.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!stockIn) {
        throw new NotFoundException('Phiếu nhập không tồn tại');
      }

      await this.revertStockIn(
        tx,
        stockIn.details.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );

      await tx.stockInDetail.deleteMany({ where: { stockInId: id } });
      return tx.stockIn.delete({ where: { id } });
    });
  }

  async findAll() {
    return this.prisma.stockIn.findMany({
      include: { supplier: true, details: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const stockIn = await this.prisma.stockIn.findUnique({
      where: { id },
      include: {
        supplier: true,
        details: { include: { product: true } },
      },
    });

    if (!stockIn) throw new NotFoundException('Phiếu nhập không tồn tại');

    const [creator, approver] = await Promise.all([
      stockIn.createdById
        ? this.prisma.user.findUnique({
            where: { id: stockIn.createdById },
            include: { profile: true },
          })
        : null,
      stockIn.approvedById
        ? this.prisma.user.findUnique({
            where: { id: stockIn.approvedById },
            include: { profile: true },
          })
        : null,
    ]);

    return {
      ...stockIn,
      creatorName: creator?.profile?.fullName || 'N/A',
      approverName: approver?.profile?.fullName || 'N/A',
    };
  }
}
