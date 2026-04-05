import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockInDto } from './dto/stock-in.dto';

@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) {}
  async createStockIn(dto: CreateStockInDto, userId: string) {
    const { supplierId, details } = dto;

    // 1. Tính tổng tiền phiếu nhập
    const totalAmount = details.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      // 2. Lấy thông tin hiện tại của các sản phẩm để tính giá vốn bình quân (MAC)
      const productIds = details.map((d) => d.productId);
      const existingProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stockQuantity: true, costPrice: true },
      });

      // Kiểm tra xem có sản phẩm nào không tồn tại không
      if (existingProducts.length !== details.length) {
        throw new BadRequestException(
          'Một hoặc nhiều sản phẩm không tồn tại trong hệ thống.',
        );
      }

      // Tạo một map để dễ truy xuất
      const productMap = new Map(existingProducts.map((p) => [p.id, p]));

      // 3. Tạo phiếu nhập
      const stockIn = await tx.stockIn.create({
        data: {
          supplierId,
          totalAmount,
          createdById: userId,
          details: {
            create: details.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // 4. Cập nhật tồn kho và Giá vốn bình quân
      for (const item of details) {
        const currentProduct = productMap.get(item.productId);

        if (!currentProduct) {
          throw new BadRequestException(
            'Một sản phẩm không tồn tại trong hệ thống khi xử lý tồn kho.',
          );
        }
        // Công thức MAC: (Tồn cũ * Giá cũ + Tồn mới * Giá mới) / (Tổng tồn)
        const oldTotalValue =
          currentProduct.stockQuantity * currentProduct.costPrice;
        const newTotalValue = item.quantity * item.price;
        const totalQuantity = currentProduct.stockQuantity + item.quantity;

        const newAverageCostPrice =
          (oldTotalValue + newTotalValue) / totalQuantity;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
            costPrice: newAverageCostPrice, // Áp dụng giá vốn bình quân
          },
        });
      }
      return stockIn;
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
    return stockIn;
  }
}
