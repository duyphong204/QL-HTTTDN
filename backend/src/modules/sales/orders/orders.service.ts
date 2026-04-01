import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { VnpayService } from 'src/modules/sales/payments/vnpay.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private vnpayService: VnpayService,
  ) {}

  private resolveActivePromotion(product: {
    promotionLinks?: Array<{
      promotion: {
        type: 'PERCENT' | 'FIXED';
        value: number;
        isActive: boolean;
        startAt: Date | null;
        endAt: Date | null;
      };
    }>;
  }) {
    const now = new Date();
    const link = (product.promotionLinks ?? []).find(({ promotion }) => {
      if (!promotion.isActive) {
        return false;
      }
      if (promotion.startAt && promotion.startAt > now) {
        return false;
      }
      if (promotion.endAt && promotion.endAt < now) {
        return false;
      }
      return true;
    });

    return link?.promotion;
  }

  private calculateSalePrice(
    price: number,
    promotion?: {
      type: 'PERCENT' | 'FIXED';
      value: number;
    },
  ) {
    if (!promotion) {
      return price;
    }

    if (promotion.type === 'PERCENT') {
      const percent = Math.max(0, Math.min(100, promotion.value));
      return Math.max(0, price * (1 - percent / 100));
    }

    return Math.max(0, price - promotion.value);
  }

  async createOrder(userId: string, dto: CreateOrderDto, clientIp?: string) {
    if (dto.paymentMethod === 'BANK_TRANSFER') {
      this.vnpayService.ensureConfigured();
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const paymentMethod: 'COD' | 'BANK_TRANSFER' =
        dto.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD';
      const paymentStatus =
        paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'UNPAID';
      const decrementStockNow = paymentMethod === 'COD';

      const orderDetailsData: Prisma.OrderDetailCreateWithoutOrderInput[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            promotionLinks: {
              include: {
                promotion: true,
              },
            },
          },
        });

        if (!product) {
          throw new BadRequestException({
            code: 'PRODUCT_NOT_FOUND',
            productId: item.productId,
            message: `Sản phẩm ${item.productId} không tồn tại`,
          });
        }

        if (decrementStockNow) {
          // COD: decrement stock at order creation.
          const stockUpdate = await tx.product.updateMany({
            where: {
              id: product.id,
              stockQuantity: {
                gte: item.quantity,
              },
            },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });

          if (stockUpdate.count === 0) {
            throw new BadRequestException({
              code: 'PRODUCT_OUT_OF_STOCK',
              productId: product.id,
              message: `Sản phẩm ${product.name} không đủ tồn kho`,
            });
          }
        } else if (product.stockQuantity < item.quantity) {
          // BANK_TRANSFER: validate current stock, actual decrement occurs after payment success.
          throw new BadRequestException({
            code: 'PRODUCT_OUT_OF_STOCK',
            productId: product.id,
            message: `Sản phẩm ${product.name} không đủ tồn kho`,
          });
        }

        const promotion = this.resolveActivePromotion(product);
        const effectivePrice = this.calculateSalePrice(
          product.price,
          promotion,
        );

        const amount = effectivePrice * item.quantity;
        totalAmount += amount;

        orderDetailsData.push({
          product: {
            connect: { id: product.id },
          },
          quantity: item.quantity,
          price: effectivePrice,
          costPrice: product.costPrice,
        });
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
        const paymentUrl = this.vnpayService.createPaymentUrl({
          orderId: order.id,
          amount: totalAmount,
          orderInfo: `Thanh toan don hang ${order.id}`,
          ipAddr: clientIp,
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

  private mapOrderForResponse(order: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: Date;
    user?: {
      email: string;
      profile: {
        fullName: string;
      } | null;
    } | null;
    details: {
      id: string;
      productId: string;
      quantity: number;
      price: number;
      product: { name: string; imageUrl: string | null };
    }[];
  }) {
    const customerName =
      order.user?.profile?.fullName || order.user?.email || order.fullName;

    return {
      id: order.id,
      fullName: order.fullName,
      customerName,
      phone: order.phone,
      address: order.address,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.details.map((d) => ({
        id: d.id,
        productId: d.productId,
        productName: d.product.name,
        quantity: d.quantity,
        price: d.price,
        imageUrl: d.product.imageUrl,
      })),
    };
  }

  async getOrders() {
    const orders = await this.prisma.order.findMany({
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
    });

    return orders.map((order) => this.mapOrderForResponse(order));
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

    return this.mapOrderForResponse(order);
  }

  private canTransition(current: string, next: string) {
    const workflow: Record<string, string[]> = {
      PENDING: ['APPROVED', 'CANCELLED'],
      APPROVED: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    return workflow[current]?.includes(next) ?? false;
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

      if (!this.canTransition(currentStatus, nextStatus)) {
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

    return this.mapOrderForResponse(updated);
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

    return this.mapOrderForResponse(updated);
  }

  // Thống kê doanh thu & lợi nhuận
  private async calculateSalesStatistics(startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      include: {
        details: true,
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalItemsSold = 0;

    for (const order of orders) {
      totalRevenue += order.totalAmount;

      for (const detail of order.details) {
        totalItemsSold += detail.quantity;
        totalCost += detail.costPrice * detail.quantity;
      }
    }

    return {
      totalOrders: orders.length,
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

  async getMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
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
    });

    return orders.map((order) => this.mapOrderForResponse(order));
  }
}
