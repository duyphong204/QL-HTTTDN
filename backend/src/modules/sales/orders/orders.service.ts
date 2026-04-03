import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async getOrders() {
        return this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                details: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getMyOrders(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                details: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getOrderById(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                details: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }

        return order;
    }

    async createOrder(userId: string, dto: CreateOrderDto) {
        return this.prisma.$transaction(async (tx) => {

            let totalAmount = 0;

            const orderDetailsData: Prisma.OrderDetailCreateWithoutOrderInput[] = [];

            for (const item of dto.items) {

                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new BadRequestException(`Sản phẩm ${item.productId} không tồn tại`);
                }

                if (product.stockQuantity < item.quantity) {
                    throw new BadRequestException(
                        `Sản phẩm ${product.name} không đủ tồn kho`
                    );
                }

                const amount = product.price * item.quantity;
                totalAmount += amount;

                orderDetailsData.push({
                    product: {
                        connect: { id: product.id }
                    },
                    quantity: item.quantity,
                    price: product.price,
                    costPrice: product.costPrice
                });

                // Trừ tồn kho
                await tx.product.update({
                    where: { id: product.id },
                    data: {
                        stockQuantity: product.stockQuantity - item.quantity
                    }
                });
            }

            return tx.order.create({
                data: {
                    userId,
                    fullName: dto.fullName,
                    phone: dto.phone,
                    address: dto.address,
                    totalAmount,
                    status: 'PENDING',
                    paymentStatus: 'UNPAID',
                    details: {
                        create: orderDetailsData
                    }
                },
                include: {
                    details: true
                }
            });
        });
    }

    async updateOrderStatus(id: string, status: string) {
        const order = await this.prisma.order.findUnique({ where: { id } });

        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }

        return this.prisma.order.update({
            where: { id },
            data: { status },
            include: {
                details: true,
            },
        });
    }

    async cancelOrder(id: string, _reason?: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { details: true },
        });

        if (!order) {
            throw new NotFoundException('Không tìm thấy đơn hàng');
        }

        if (order.status === 'CANCELLED') {
            return order;
        }

        return this.prisma.$transaction(async (tx) => {
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

            return tx.order.update({
                where: { id },
                data: { status: 'CANCELLED' },
                include: { details: true },
            });
        });
    }

    // Thống kê doanh thu & lợi nhuận
    async getSalesStatistics(month?: number, year?: number) {

        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || new Date().getMonth() + 1;

        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'COMPLETED'
            },
            include: {
                details: true
            }
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
            month: currentMonth,
            year: currentYear,
            totalOrders: orders.length,
            totalItemsSold,
            totalRevenue,
            totalProfit: totalRevenue - totalCost
        };
    }
    async getOrdersByPeriod(year: number, quarter?: number) {
        let startDate: Date, endDate: Date;
        if (quarter) {
            const startMonth = (quarter - 1) * 3;
            startDate = new Date(year, startMonth, 1);
            endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
        } else {
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
        }
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED',
            },
            include: { details: true },
            orderBy: { createdAt: 'desc' },
        });
        let totalRevenue = 0, totalCost = 0, totalItems = 0;
        for (const o of orders) {
            totalRevenue += o.totalAmount;
            for (const d of o.details) {
                totalItems += d.quantity;
                totalCost += d.costPrice * d.quantity;
            }
        }
        return {
            period: { year, quarter },
            totalOrders: orders.length,
            totalItemsSold: totalItems,
            totalRevenue,
            totalProfit: totalRevenue - totalCost,
            orders,
        };
    }
}