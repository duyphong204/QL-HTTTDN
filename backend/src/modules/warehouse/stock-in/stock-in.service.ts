import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockInDto } from './dto/stock-in.dto';
import { StockInStatus } from '@prisma/client';
@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) { }
  async createStockIn(dto: CreateStockInDto, userId: string) {
    const { supplierId, details } = dto;

    const totalAmount = details.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return this.prisma.stockIn.create({
      data: {
        supplierId,
        totalAmount,
        createdById: userId, // Lưu người tạo
        status: StockInStatus.PENDING,
        details: {
          create: details.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }
  // 2. XÁC NHẬN NHẬP KHO
  async confirmStockIn(id: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Kiểm tra phiếu nhập
      const stockIn = await tx.stockIn.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!stockIn) throw new NotFoundException('Phiếu nhập không tồn tại');
      if (stockIn.status !== StockInStatus.PENDING) {
        throw new BadRequestException('Phiếu này đã được xử lý hoặc bị hủy');
      }

      // Cập nhật từng sản phẩm trong phiếu
      for (const item of stockIn.details) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại`);

        // Công thức MAC: (Tồn cũ * Giá cũ + Tồn mới * Giá mới) / (Tổng tồn mới)
        const totalQuantity = product.stockQuantity + item.quantity;
        const newCostPrice =
          ((product.stockQuantity * product.costPrice) + (item.quantity * item.price))
          / totalQuantity;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            costPrice: newCostPrice,
          },
        });
      }

      // Cập nhật trạng thái phiếu và người duyệt
      return tx.stockIn.update({
        where: { id },
        data: {
          status: StockInStatus.COMPLETED,
          approvedById: adminId, // Lưu người duyệt
        },
      });
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
      stockIn.createdById ? this.prisma.user.findUnique({
        where: { id: stockIn.createdById },
        include: { profile: true }
      }) : null,
      stockIn.approvedById ? this.prisma.user.findUnique({
        where: { id: stockIn.approvedById },
        include: { profile: true }
      }) : null,
    ]);

    return {
      ...stockIn,
      creatorName: creator?.profile?.fullName || 'N/A',
      approverName: approver?.profile?.fullName || 'Chủ shop',
    };
  }
}
