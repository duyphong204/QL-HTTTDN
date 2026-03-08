import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }
  async findAll(search?: string, categoryId?: string) {
    return this.prisma.product.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(categoryId && { categoryId }),
      },
      include: {
        supplier: true,
        category: true,
      },
    });
  }
  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }
  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
  async update(id: string, dto: CreateProductDto) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }
  async getInventoryStatistics() {
    // 1. Tổng số hàng đang tồn trong kho
    const totalStock = await this.prisma.product.aggregate({
      _sum: { stockQuantity: true }
    });

    // 2. Tổng giá trị kho hàng (giá trị lưu kho dựa vào costPrice)
    const allProducts = await this.prisma.product.findMany({ select: { stockQuantity: true, costPrice: true } });
    const totalInventoryValue = allProducts.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);

    // 3. Các sản phẩm sắp hết hàng (dưới minStock)
    const lowStockProducts = await this.prisma.product.findMany({
      where: { stockQuantity: { lte: this.prisma.product.fields.minStock } },
      select: { id: true, name: true, stockQuantity: true, minStock: true }
    });
    return {
      totalStockItems: totalStock._sum.stockQuantity || 0,
      totalInventoryValue,
      lowStockAlerts: lowStockProducts
    };
  }
}
