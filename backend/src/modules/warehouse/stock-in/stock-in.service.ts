import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockInDto } from './dto/stock-in.dto';

@Injectable()
export class StockInService {
  constructor(private readonly prisma: PrismaService) {}
  async createStockIn(dto: CreateStockInDto, userId: string) {
    const { supplierId, details } = dto;
    // tinh tong tien phieu nhap
    const totalAmount = details.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    return this.prisma.$transaction(async (tx) => {
      // tao phieu nhap
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
      for (const items of details) {
        await tx.product.update({
          where: { id: items.productId },
          data: {
            stockQuantity: { increment: items.quantity },
            costPrice: items.price, // cap nhat gia moi
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
}
