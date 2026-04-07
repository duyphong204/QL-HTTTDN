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
  ) { }

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

    // 1. Bộ lọc động + Soft Delete (Chỉ lấy sản phẩm chưa bị xóa)
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
    };

    // 2. Mapping Sort Order
    const sortMapping = {
      price: { price: sortOrder },
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
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true, supplier: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm hoặc đã bị xóa');
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
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getWarehouseReport(month?: number, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const startDate = month
      ? new Date(targetYear, month - 1, 1)
      : new Date(targetYear, 0, 1);
    const endDate = month
      ? new Date(targetYear, month, 0, 23, 59, 59)
      : new Date(targetYear, 11, 31, 23, 59, 59);

    const [stockInStats, productStats, lowStockProducts] = await Promise.all([
      // Thống kê nhập kho
      this.prisma.stockIn.aggregate({
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.product.aggregate({
        where: { deletedAt: null },
        _sum: { stockQuantity: true },
        _count: { id: true },
      }),
      this.prisma.product.findMany({
        where: {
          deletedAt: null,
          OR: [
            { stockQuantity: { lte: 10 } },
          ]
        },
        select: { id: true, name: true, stockQuantity: true, minStock: true },
        orderBy: { stockQuantity: 'asc' },
        take: 10,
      }),
    ]);

    return {
      period: { month, year: targetYear },
      totalStockIns: stockInStats._count.id,
      totalImportValue: stockInStats._sum.totalAmount || 0,
      totalProductTypes: productStats._count.id,
      totalStockQuantity: productStats._sum.stockQuantity || 0,
      lowStockProducts,
    };
  }
}
