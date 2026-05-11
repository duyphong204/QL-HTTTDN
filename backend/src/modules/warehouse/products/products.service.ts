import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CloudinaryService,
  type UploadedImageFile,
} from 'src/common/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';
import { enrichProductPricing } from 'src/common/utils/pricing.helper';
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
      (('buffer' in file && !!(file as { buffer?: unknown }).buffer) ||
        ('path' in file &&
          typeof (file as { path?: unknown }).path === 'string'))
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
      inStock,
      sortBy = 'featured',
      sortOrder = 'asc',
      page = 1,
      limit = 9,
    } = query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const normalizedSearch = search ? normalizeVietnamese(search) : '';

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (typeof inStock === 'boolean') {
      where.stockQuantity = inStock ? { gt: 0 } : { lte: 0 };
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
            : sortBy === 'price'
              ? { price: sortOrder }
              : sortBy === 'costPrice'
                ? { costPrice: sortOrder }
                : sortBy === 'stockQuantity'
                  ? { stockQuantity: sortOrder }
                  : { name: sortOrder };

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
          promotionLinks: {
            include: {
              promotion: true,
            },
          },
        },
        orderBy,
      });

      const pricedProducts = allProducts.map((product) =>
        enrichProductPricing(product),
      );

      const filteredProducts = pricedProducts.filter((product) =>
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
              promotionLinks: {
                include: {
                  promotion: true,
                },
              },
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
              promotionLinks: {
                include: {
                  promotion: true,
                },
              },
            },
            orderBy,
          })
        : Promise.resolve([]),
    ]);

    const data = [...inStockData, ...outOfStockData].map((product) =>
      enrichProductPricing(product),
    );

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
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        supplier: true,
        promotionLinks: {
          include: {
            promotion: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return enrichProductPricing(product);
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

  async getStats() {
    const [total, stockAgg, outOfStock, topSelling] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.aggregate({
        where: { deletedAt: null },
        _sum: { stockQuantity: true },
      }),
      this.prisma.product.count({
        where: { deletedAt: null, stockQuantity: { lte: 0 } },
      }),
      this.prisma.orderDetail.findMany({
        where: { order: { status: 'COMPLETED' } },
        distinct: ['productId'],
        select: { productId: true },
      }),
    ]);

    return {
      total,
      totalStock: stockAgg._sum.stockQuantity ?? 0,
      outOfStock,
      topSelling: topSelling.length,
    };
  }

  async remove(id: string) {
    await this.findOne(id); // ném 404 nếu không tồn tại hoặc đã bị ẩn

    const [unpaidOrderCount, cartItemCount] = await Promise.all([
      this.prisma.orderDetail.count({
        where: { productId: id, order: { paymentStatus: { not: 'PAID' } } },
      }),
      this.prisma.cartItem.count({ where: { productId: id } }),
    ]);

    if (unpaidOrderCount > 0) {
      throw new BadRequestException(
        'Sản phẩm đang có trong đơn hàng chưa thanh toán. Hãy thanh toán hoặc hủy các đơn này trước.',
      );
    }

    if (cartItemCount > 0) {
      throw new BadRequestException(
        'Sản phẩm đang có trong giỏ hàng của khách. Vui lòng chờ người dùng xóa khỏi giỏ trước.',
      );
    }

    // Soft delete — giữ nguyên FK relations (lịch sử đơn hàng, phiếu nhập, khuyến mãi)
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
