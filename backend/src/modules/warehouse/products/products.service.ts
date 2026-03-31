import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto/product.dto';

const normalizeVietnamese = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  private isUploadFile(
    file: unknown,
  ): file is Parameters<CloudinaryService['uploadImage']>[0] {
    return (
      typeof file === 'object' &&
      file !== null &&
      'buffer' in file &&
      !!(file as { buffer?: unknown }).buffer
    );
  }

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      supplierId,
      minPrice,
      maxPrice,
      sortBy = 'featured',
      page = 1,
      limit = 9,
    } = query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.ProductWhereInput = {};
    const normalizedSearch = search ? normalizeVietnamese(search) : '';

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }

    const priceFilter: Prisma.FloatFilter = {};
    if (typeof minPrice === 'number' && Number.isFinite(minPrice)) {
      priceFilter.gte = minPrice;
    }
    if (typeof maxPrice === 'number' && Number.isFinite(maxPrice)) {
      priceFilter.lte = maxPrice;
    }
    if (Object.keys(priceFilter).length > 0) {
      where.price = priceFilter;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'price-low'
        ? { price: 'asc' }
        : sortBy === 'price-high'
          ? { price: 'desc' }
          : sortBy === 'newest'
            ? { id: 'desc' }
            : { name: 'asc' };

    const inStockWhere: Prisma.ProductWhereInput = {
      ...where,
      stockQuantity: { gt: 0 },
    };
    const outOfStockWhere: Prisma.ProductWhereInput = {
      ...where,
      stockQuantity: { lte: 0 },
    };

    if (normalizedSearch) {
      const allProducts = await this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy,
      });

      const filteredProducts = allProducts.filter((product) =>
        normalizeVietnamese(product.name).includes(normalizedSearch),
      );

      const inStockProducts = filteredProducts.filter(
        (product) => product.stockQuantity > 0,
      );
      const outOfStockProducts = filteredProducts.filter(
        (product) => product.stockQuantity <= 0,
      );
      const orderedProducts = [...inStockProducts, ...outOfStockProducts];

      const pagedProducts = orderedProducts.slice(skip, skip + limitNumber);

      return {
        data: pagedProducts,
        meta: {
          total: orderedProducts.length,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(orderedProducts.length / limitNumber) || 1,
        },
      };
    }

    const [inStockTotal, outOfStockTotal] = await this.prisma.$transaction([
      this.prisma.product.count({ where: inStockWhere }),
      this.prisma.product.count({ where: outOfStockWhere }),
    ]);

    const total = inStockTotal + outOfStockTotal;
    let inStockSkip = 0;
    let inStockTake = 0;
    let outOfStockSkip = 0;
    let outOfStockTake = 0;

    if (skip < inStockTotal) {
      inStockSkip = skip;
      inStockTake = Math.min(limitNumber, inStockTotal - skip);
      outOfStockTake = limitNumber - inStockTake;
    } else {
      outOfStockSkip = skip - inStockTotal;
      outOfStockTake = limitNumber;
    }

    const [inStockData, outOfStockData] = await Promise.all([
      inStockTake > 0
        ? this.prisma.product.findMany({
            where: inStockWhere,
            skip: inStockSkip,
            take: inStockTake,
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
            orderBy,
          })
        : Promise.resolve([]),
      outOfStockTake > 0
        ? this.prisma.product.findMany({
            where: outOfStockWhere,
            skip: outOfStockSkip,
            take: outOfStockTake,
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
            orderBy,
          })
        : Promise.resolve([]),
    ]);

    const data = [...inStockData, ...outOfStockData];

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber) || 1,
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

  async create(dto: CreateProductDto, file?: unknown) {
    let imageUrl: string | undefined;

    if (this.isUploadFile(file)) {
      imageUrl = await this.cloudinary.uploadImage(file);
    }

    return this.prisma.product.create({
      data: { ...dto, imageUrl },
    });
  }

  async update(id: string, dto: UpdateProductDto, file?: unknown) {
    const existing = await this.findOne(id);
    let imageUrl = existing.imageUrl;

    if (this.isUploadFile(file)) {
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
      try {
        await this.cloudinary.deleteImage(product.imageUrl);
      } catch (error) {
        this.logger.warn(
          `Delete Cloudinary image failed for product ${id}: ${String(error)}`,
        );
      }
    }

    return this.prisma.product.delete({ where: { id } });
  }
}
