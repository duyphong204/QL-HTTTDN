import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateStockInDto,
  QueryStockInDto,
  UpdateStockInDto,
} from './dto/stock-in.dto';
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
    if (!product)
      throw new NotFoundException(`Sản phẩm ${productId} không tồn tại`);

    const newQuantity = product.stockQuantity + quantityChange;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Sản phẩm ${product.name} đã được xuất bán, không thể hoàn tác số lượng lớn hơn tồn kho hiện tại (Hiện có: ${product.stockQuantity})`,
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
      const totalAmount = dto.details.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      for (const item of dto.details) {
        await this.applyStockChange(
          tx,
          item.productId,
          item.quantity,
          item.price,
        );
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
      if (oldStockIn.status === StockInStatus.CANCELLED) {
        throw new BadRequestException('Không thể sửa phiếu nhập đã bị hủy');
      }

      for (const oldItem of oldStockIn.details) {
        await this.applyStockChange(
          tx,
          oldItem.productId,
          -oldItem.quantity,
          oldItem.price,
        );
      }

      const nextDetails = dto.details || oldStockIn.details;
      for (const newItem of nextDetails) {
        await this.applyStockChange(
          tx,
          newItem.productId,
          newItem.quantity,
          newItem.price,
        );
      }

      const totalAmount = nextDetails.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

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
      if (stockIn.status === StockInStatus.CANCELLED) {
        throw new BadRequestException('Phiếu nhập đã bị hủy trước đó');
      }

      // Hoàn lại tồn kho (reverse weighted-average cost)
      for (const item of stockIn.details) {
        await this.applyStockChange(
          tx,
          item.productId,
          -item.quantity,
          item.price,
        );
      }

      // Soft-cancel: giữ record cho lịch sử báo cáo, không hard-delete
      return tx.stockIn.update({
        where: { id },
        data: { status: StockInStatus.CANCELLED },
        include: { supplier: true, details: { include: { product: true } } },
      });
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

  async findAll(query: QueryStockInDto = {}) {
    const { month, year, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = month && year
      ? { date: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0, 23, 59, 59) } }
      : year
        ? { date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } }
        : {};

    const [data, total] = await Promise.all([
      this.prisma.stockIn.findMany({
        where,
        skip,
        take: limit,
        include: { supplier: true, details: { include: { product: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.stockIn.count({ where }),
    ]);
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
