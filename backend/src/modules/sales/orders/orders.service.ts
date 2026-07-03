import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { MomoService } from 'src/modules/sales/payments/momo.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  calculateSalePrice,
  resolveActivePromotion as resolveProductPromotion,
} from 'src/common/utils/pricing.helper';
import { mapOrderForResponse } from './orders.mapper';
import { canTransition } from './orders.workflow';
import { calculatePaginationSkip, buildPaginatedResponse } from 'src/common/utils/pagination.helper';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private momoService: MomoService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    if (dto.paymentMethod === 'BANK_TRANSFER') {
      this.momoService.ensureConfigured();
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. CHỐNG N+1 QUERY: Fetch toàn bộ products trong 1 câu lệnh duy nhất
      const productIds = dto.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: {
          promotionLinks: {
            include: { promotion: true },
          },
        },
      });

      // 2. Tạo Map để tra cứu O(1) thay vì lặp qua mảng liên tục
      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalAmount = 0;
      const paymentMethod: 'COD' | 'BANK_TRANSFER' =
        dto.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD';
      const paymentStatus =
        paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'UNPAID';
      const decrementStockNow = paymentMethod === 'COD';

      const orderDetailsData: Prisma.OrderDetailCreateWithoutOrderInput[] = [];

      // 3. Vòng lặp thứ nhất: Tính toán và Validate dữ liệu (KHÔNG QUERIES DB Ở ĐÂY)
      for (const item of dto.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new BadRequestException({
            code: 'PRODUCT_NOT_FOUND',
            productId: item.productId,
            message: `Sản phẩm ${item.productId} không tồn tại`,
          });
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException({
            code: 'PRODUCT_OUT_OF_STOCK',
            productId: product.id,
            message: `Sản phẩm ${product.name} không đủ tồn kho`,
          });
        }

        const promotion = resolveProductPromotion(product);
        const effectivePrice = calculateSalePrice(product.price, promotion);

        const amount = effectivePrice * item.quantity;
        totalAmount += amount;

        orderDetailsData.push({
          product: { connect: { id: product.id } },
          quantity: item.quantity,
          price: effectivePrice,
          costPrice: product.costPrice,
        });
      }

      // 4. Cập nhật số lượng tồn kho (nếu là COD) theo cách update tuần tự an toàn
      if (decrementStockNow) {
        for (const item of dto.items) {
          const stockUpdate = await tx.product.updateMany({
            where: {
              id: item.productId,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (stockUpdate.count === 0) {
            const product = productMap.get(item.productId);
            throw new BadRequestException({
              code: 'PRODUCT_OUT_OF_STOCK',
              productId: item.productId,
              message: `Sản phẩm ${product?.name} đã hết hàng ngay trước khi đặt`,
            });
          }
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          fullName: dto.fullName,
          phone: dto.phone,
          address: dto.address,
          totalAmount,
          paymentMethod,
          paymentStatus,
          details: {
            create: orderDetailsData,
          },
        },
        include: {
          details: true,
        },
      });

      if (paymentMethod === 'BANK_TRANSFER') {
        const paymentUrl = await this.momoService.createPaymentUrl({
          orderId: order.id,
          amount: totalAmount,
          orderInfo: `Thanh toan don hang ${order.id}`,
        });

        return {
          order,
          paymentUrl,
          requiresPayment: true,
        };
      }

      return {
        order,
        requiresPayment: false,
      };
    });
  }

  async retryOrderPayment(userId: string, orderId: string) {
    this.momoService.ensureConfigured();

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        details: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng');
    }

    if (order.userId !== userId) {
      throw new BadRequestException(
        'Bạn không có quyền thanh toán đơn hàng này',
      );
    }

    if (order.paymentMethod !== 'BANK_TRANSFER') {
      throw new BadRequestException(
        'Đơn hàng này không dùng phương thức thanh toán online',
      );
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        'Đơn hàng đã hủy, không thể thanh toán lại',
      );
    }

    // CHỐNG N+1 QUERY: Fetch toàn bộ product liên quan một lần duy nhất
    const productIds = order.details.map((detail) => detail.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const detail of order.details) {
      const product = productMap.get(detail.productId);

      if (!product) {
        throw new BadRequestException(
          `Sản phẩm ${detail.productId} không còn tồn tại, không thể thanh toán lại`,
        );
      }

      if (product.stockQuantity < detail.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${product.name} không đủ tồn kho để thanh toán đơn hàng này`,
        );
      }
    }

    const paymentUrl = await this.momoService.createPaymentUrl({
      orderId: order.id,
      amount: order.totalAmount,
      orderInfo: `Thanh toan don hang ${order.id}`,
    });

    return {
      order,
      paymentUrl,
      requiresPayment: true,
    };
  }



  async getOrders(query: QueryOrderDto) {
    const { page = 1, limit = 10, status, paymentStatus } = query;
    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = orders.map((order) => mapOrderForResponse(order));
    return buildPaginatedResponse(data, total, page, limit);
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        details: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng');
    }

    return mapOrderForResponse(order);
  }



  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const nextStatus = dto.status.toUpperCase();

    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new BadRequestException('Không tìm thấy đơn hàng');
      }

      const currentStatus = order.status.toUpperCase();

      if (currentStatus === nextStatus) {
        return order;
      }

      if (!canTransition(currentStatus, nextStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ ${currentStatus} sang ${nextStatus}`,
        );
      }

      if (
        order.paymentMethod === 'BANK_TRANSFER' &&
        order.paymentStatus !== 'PAID' &&
        ['APPROVED', 'SHIPPING', 'COMPLETED'].includes(nextStatus)
      ) {
        throw new BadRequestException(
          'Đơn chuyển khoản chưa thanh toán, không thể xác nhận/giao/hoàn thành',
        );
      }

      const nextOrder = await tx.order.update({
        where: { id },
        data: {
          status: nextStatus,
        },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return nextOrder;
    });

    return mapOrderForResponse(updated);
  }

  async cancelOrder(id: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new BadRequestException('Không tìm thấy đơn hàng');
      }

      const status = order.status.toUpperCase();
      if (status === 'CANCELLED') {
        return order;
      }

      if (!['PENDING', 'APPROVED'].includes(status)) {
        throw new BadRequestException(
          'Chỉ có thể hủy đơn ở trạng thái PENDING hoặc APPROVED',
        );
      }

      const shouldRestoreStock =
        order.paymentMethod === 'COD' || order.paymentStatus === 'PAID';

      if (shouldRestoreStock) {
        for (const detail of order.details) {
          await tx.product.update({
            where: { id: detail.productId },
            data: {
              stockQuantity: {
                increment: detail.quantity,
              },
            },
          });
        }
      }

      const cancelled = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return cancelled;
    });

    return mapOrderForResponse(updated);
  }

  // Thống kê doanh thu & lợi nhuận
  private async calculateSalesStatistics(startDate: Date, endDate: Date) {
    const orderWhere = {
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    };

    // 1. TỐI ƯU: Sử dụng aggregate để DB tính tổng số đơn và doanh thu
    // Chỉ select quantity và costPrice để tự tính lợi nhuận (vì Prisma chưa hỗ trợ SUM(a * b) native)
    const [orderAgg, orderDetails] = await Promise.all([
      this.prisma.order.aggregate({
        where: orderWhere,
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.orderDetail.findMany({
        where: { order: orderWhere },
        select: { quantity: true, costPrice: true },
      }),
    ]);

    const totalOrders = orderAgg._count.id;
    const totalRevenue = orderAgg._sum.totalAmount ?? 0;

    let totalItemsSold = 0;
    let totalCost = 0;

    // 2. Vòng lặp siêu nhẹ (chỉ duyệt mảng vài field nhỏ, không chứa full Order data)
    for (const detail of orderDetails) {
      totalItemsSold += detail.quantity;
      totalCost += detail.costPrice * detail.quantity;
    }

    return {
      totalOrders,
      totalItemsSold,
      totalProductsSold: totalItemsSold,
      totalRevenue,
      totalProfit: totalRevenue - totalCost,
    };
  }

  async getSalesStatistics(month?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const stats = await this.calculateSalesStatistics(startDate, endDate);

    return {
      month: currentMonth,
      year: currentYear,
      ...stats,
    };
  }

  async getSalesStatisticsByPeriod(year?: number, quarter?: number) {
    const currentYear = year || new Date().getFullYear();

    if (quarter && (quarter < 1 || quarter > 4)) {
      throw new BadRequestException(
        'Quý không hợp lệ, chỉ nhận giá trị từ 1 đến 4',
      );
    }

    const startMonth = quarter ? (quarter - 1) * 3 : 0;
    const endMonth = quarter ? startMonth + 3 : 12;

    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(currentYear, endMonth, 0, 23, 59, 59);

    const stats = await this.calculateSalesStatistics(startDate, endDate);

    return {
      year: currentYear,
      quarter: quarter ?? null,
      ...stats,
    };
  }

  async getMyOrders(userId: string, query: QueryOrderDto) {
    const { page = 1, limit = 10, status, paymentStatus } = query;
    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.OrderWhereInput = { userId };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          details: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = orders.map((order) => mapOrderForResponse(order));
    return buildPaginatedResponse(data, total, page, limit);
  }
}
