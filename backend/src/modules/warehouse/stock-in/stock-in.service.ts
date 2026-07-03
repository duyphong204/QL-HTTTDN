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
import {
  calculatePaginationSkip,
  buildPaginatedResponse,
} from 'src/common/utils/pagination.helper';

@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) {}

  private async applyStockChange(
    tx: Prisma.TransactionClient,
    product: any,
    quantityChange: number,
    unitPrice: number,
  ) {
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

    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stockQuantity: newQuantity, costPrice: newCostPrice },
    });

    // Object.assign gán đè dữ liệu mới nhất vào Object trong RAM
    Object.assign(product, updatedProduct);
  }

  async createStockIn(dto: CreateStockInDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const productIds = dto.details.map((item) => item.productId);
      
      // Fetch toàn bộ Product 1 lần để chống N+1 Query
      const products = await tx.product.findMany({
        where: { id: { in: [...new Set(productIds)] } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      const totalAmount = dto.details.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      for (const item of dto.details) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại`);
        }
        await this.applyStockChange(tx, product, item.quantity, item.price);
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

      const nextDetails = dto.details || oldStockIn.details;

      const allProductIds = [
        ...oldStockIn.details.map((item) => item.productId),
        ...nextDetails.map((item) => item.productId),
      ];
      
      // Fetch toàn bộ Product (cả cũ lẫn mới) 1 lần
      const products = await tx.product.findMany({
        where: { id: { in: [...new Set(allProductIds)] } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Hoàn lại kho cũ
      for (const oldItem of oldStockIn.details) {
        const product = productMap.get(oldItem.productId);
        if (!product) throw new NotFoundException(`Sản phẩm ${oldItem.productId} không tồn tại`);
        await this.applyStockChange(tx, product, -oldItem.quantity, oldItem.price);
      }

      // Áp dụng kho mới
      for (const newItem of nextDetails) {
        const product = productMap.get(newItem.productId);
        if (!product) throw new NotFoundException(`Sản phẩm ${newItem.productId} không tồn tại`);
        await this.applyStockChange(tx, product, newItem.quantity, newItem.price);
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

      const productIds = stockIn.details.map((item) => item.productId);
      
      const products = await tx.product.findMany({
        where: { id: { in: [...new Set(productIds)] } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Hoàn lại tồn kho (reverse weighted-average cost)
      for (const item of stockIn.details) {
        const product = productMap.get(item.productId);
        if (!product) throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại`);
        await this.applyStockChange(
          tx,
          product,
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
    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.StockInWhereInput = month && year
      ? { date: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0, 23, 59, 59) } }
      : year
        ? { date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } }
        : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockIn.findMany({
        where,
        skip,
        take: Number(limit),
        include: { supplier: true, details: { include: { product: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.stockIn.count({ where }),
    ]);
    
    return buildPaginatedResponse(data, total, page, limit);
  }
}
