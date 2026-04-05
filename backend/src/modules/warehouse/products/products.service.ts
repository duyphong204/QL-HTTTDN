import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';
import {
  calculatePaginationSkip,
  buildPaginatedResponse,
} from 'src/common/utils/pagination.helper';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      supplierId,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;
    const skip = calculatePaginationSkip(page, limit);

    // 1. Xây dựng bộ lọc động
    const where: Prisma.ProductWhereInput = {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
    };

    // 2. Mapping Sort Order (Tránh If/Else lồng nhau)
    const sortMapping = {
      price: { price: sortOrder },
      costPrice: { costPrice: sortOrder },
      stockQuantity: { stockQuantity: sortOrder },
      name: { name: sortOrder },
    };
    const orderBy = sortMapping[sortBy] || { name: 'asc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinary.uploadImage(file);
    }

    return this.prisma.product.create({
      data: { ...dto, imageUrl },
    });
  }

  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    const existing = await this.findOne(id);
    let imageUrl = existing.imageUrl;

    if (file) {
      // Chỉ xóa ảnh cũ sau khi đã upload ảnh mới thành công (để tránh mất ảnh nếu upload fail)
      const newImageUrl = await this.cloudinary.uploadImage(file);
      if (existing.imageUrl) {
        await this.cloudinary.deleteImage(existing.imageUrl).catch(() => null);
      }
      imageUrl = newImageUrl;
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, imageUrl },
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Xóa ảnh trên Cloudinary trước khi xóa record trong DB
    if (product.imageUrl) {
      await this.cloudinary.deleteImage(product.imageUrl).catch(() => null);
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async getWarehouseReport(month?: number, year?: number) {
    const targetYear = year || new Date().getFullYear();

    // Tạo khoảng thời gian chính xác
    const startDate = month
      ? new Date(targetYear, month - 1, 1)
      : new Date(targetYear, 0, 1);
    const endDate = month
      ? new Date(targetYear, month, 0, 23, 59, 59)
      : new Date(targetYear, 11, 31, 23, 59, 59);

    const where: Prisma.StockInWhereInput = {
      date: { gte: startDate, lte: endDate },
    };

    // TỐI ƯU: Sử dụng Aggregate thay vì mảng reduce
    const [stockInStats, stockInDetailStats, productStats, lowStockProducts] =
      await Promise.all([
        this.prisma.stockIn.aggregate({
          where,
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        this.prisma.stockInDetail.aggregate({
          where: { stockIn: where },
          _sum: { quantity: true },
        }),
        this.prisma.product.aggregate({
          _sum: { stockQuantity: true },
          _count: { id: true },
        }),
        this.prisma.$queryRaw<any[]>`
        SELECT id, name, "stockQuantity", "minStock"
        FROM "Product"
        WHERE "stockQuantity" <= "minStock"
        ORDER BY "stockQuantity" ASC
      `,
      ]);

    return {
      period: { month, year: targetYear },
      totalStockIns: stockInStats._count.id,
      totalImportValue: stockInStats._sum.totalAmount || 0,
      totalImportQuantity: stockInDetailStats._sum.quantity || 0,
      totalProductTypes: productStats._count.id,
      totalStockQuantity: productStats._sum.stockQuantity || 0,
      lowStockProducts,
    };
  }
}
