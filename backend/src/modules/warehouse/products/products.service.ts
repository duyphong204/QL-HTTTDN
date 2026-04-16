import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CloudinaryService,
  type UploadedImageFile,
} from 'src/common/cloudinary/cloudinary.service';
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

    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
    const skip = calculatePaginationSkip(safePage, safeLimit);

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

    const sortMapping: Record<
      'name' | 'price' | 'costPrice' | 'stockQuantity',
      Prisma.ProductOrderByWithRelationInput
    > = {
      name: { name: sortOrder },
      price: { price: sortOrder },
      costPrice: { costPrice: sortOrder },
      stockQuantity: { stockQuantity: sortOrder },
    };
    const orderBy = sortMapping[sortBy] ?? { name: 'asc' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: safeLimit,
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, safePage, safeLimit);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true, supplier: true },
    });
    if (!product)
      throw new NotFoundException('Không tìm thấy sản phẩm hoặc đã bị xóa');
    return product;
  }

  async create(dto: CreateProductDto, file?: UploadedImageFile) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinary.uploadImage(file);
    }

    return this.prisma.product.create({
      data: { ...dto, imageUrl },
    });
  }

  async update(id: string, dto: UpdateProductDto, file?: UploadedImageFile) {
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
}
