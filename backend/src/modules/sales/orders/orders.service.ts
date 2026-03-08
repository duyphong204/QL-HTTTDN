import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

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
                    status: 'COMPLETED',
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
}