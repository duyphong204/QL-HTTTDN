import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockInDto, UpdateStockInDto } from './dto/stock-in.dto';
import { Prisma, StockInStatus } from '@prisma/client';

@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) {}

  private async applyStockChange(
    tx: Prisma.TransactionClient,
    productId: string,
    quantityChange: number,
    unitPrice: number,
  ) {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Sản phẩm ${productId} không tồn tại`);

    const newQuantity = product.stockQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Sản phẩm ${product.name} đã được xuất bán, không thể hoàn tác số lượng lớn hơn tồn kho hiện tại (Hiện có: ${product.stockQuantity})`
      );
    }

    let newCostPrice = product.costPrice;
    if (quantityChange > 0) {
      const currentTotalValue = product.stockQuantity * product.costPrice;
      const incomingValue = quantityChange * unitPrice;
      newCostPrice = (currentTotalValue + incomingValue) / newQuantity;
    }

    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: newQuantity, costPrice: newCostPrice },
    });
  }

  async createStockIn(dto: CreateStockInDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const totalAmount = dto.details.reduce((sum, item) => sum + item.quantity * item.price, 0);

      for (const item of dto.details) {
        await this.applyStockChange(tx, item.productId, item.quantity, item.price);
      }

      return tx.stockIn.create({
        data: {
          supplierId: dto.supplierId,
          totalAmount,
          createdById: userId,
          status: StockInStatus.COMPLETED,
          details: {
            create: dto.details.map((item) => ({
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
      const oldStockIn = await tx.stockIn.findUnique({
        where: { id },
        include: { details: true },
      });
      if (!oldStockIn) throw new NotFoundException('Phiếu nhập không tồn tại');

      for (const oldItem of oldStockIn.details) {
        await this.applyStockChange(tx, oldItem.productId, -oldItem.quantity, oldItem.price);
      }

      const nextDetails = dto.details || oldStockIn.details;
      for (const newItem of nextDetails) {
        await this.applyStockChange(tx, newItem.productId, newItem.quantity, newItem.price);
      }

      const totalAmount = nextDetails.reduce((sum, item) => sum + item.quantity * item.price, 0);

      await tx.stockInDetail.deleteMany({ where: { stockInId: id } });
      return tx.stockIn.update({
        where: { id },
        data: {
          supplierId: dto.supplierId ?? oldStockIn.supplierId,
          totalAmount,
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
      if (!stockIn) throw new NotFoundException('Phiếu nhập không tồn tại');

      for (const item of stockIn.details) {
        await this.applyStockChange(tx, item.productId, -item.quantity, item.price);
      }

      await tx.stockInDetail.deleteMany({ where: { stockInId: id } });
      return tx.stockIn.delete({ where: { id } });
    });
  }

  async findOne(id: string) {
    const stockIn = await this.prisma.stockIn.findUnique({
      where: { id },
      include: {
        supplier: true,
        details: { include: { product: true } },
        createdBy: { select: { profile: { select: { fullName: true } } } },
      },
    });
    if (!stockIn) throw new NotFoundException('Phiếu nhập không tồn tại');

    return {
      ...stockIn,
      creatorName: stockIn.createdBy?.profile?.fullName ?? 'N/A',
      createdBy: undefined,
    };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.stockIn.findMany({
        skip,
        take: limit,
        include: { supplier: true, details: { include: { product: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.stockIn.count(),
    ]);
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
