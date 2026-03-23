import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

  async findAll(query: QueryProductDto) {
    const { search, categoryId, supplierId, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
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
      if (existing.imageUrl) {
        await this.cloudinary.deleteImage(existing.imageUrl);
      }
      imageUrl = await this.cloudinary.uploadImage(file);
    }

    return this.prisma.product.update({
      where: { id },
      data: { ...dto, imageUrl },
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if (product.imageUrl) {
      await this.cloudinary.deleteImage(product.imageUrl);
    }

    return this.prisma.product.delete({ where: { id } });
  }
  async getWarehouseReport(month?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const where: Prisma.StockInWhereInput = {};
    if (month && year) {
      where.date = {
        gte: new Date(currentYear, month - 1, 1),
        lte: new Date(currentYear, month, 0, 23, 59, 59),
      };
    } else if (year) {
      where.date = {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31, 23, 59, 59),
      };
    }
    const stockIns = await this.prisma.stockIn.findMany({
      where,
      include: { details: true },
    });
    const totalImportValue = stockIns.reduce((s, si) => s + si.totalAmount, 0);
    const totalImportQuantity = stockIns.reduce(
      (s, si) => s + si.details.reduce((sq, d) => sq + d.quantity, 0), 0
    );
    const stockAggregate = await this.prisma.product.aggregate({
      _sum: { stockQuantity: true },
      _count: { id: true },
    });
    const lowStockProducts = await this.prisma.product.findMany({
      where: { stockQuantity: { lte: this.prisma.product.fields.minStock } },
      select: { id: true, name: true, stockQuantity: true, minStock: true },
    });
    return {
      period: { month, year: currentYear },
      totalStockIns: stockIns.length,
      totalImportValue,
      totalImportQuantity,
      totalProductTypes: stockAggregate._count.id,
      totalStockQuantity: stockAggregate._sum.stockQuantity || 0,
      lowStockProducts,
    };
  }
}
