import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { OrdersService } from './sales/orders/orders.service';
import { CartService } from './sales/cart/cart.service';
import { StockOutService } from './sales/stock-out/stock-out.service';
import { PromotionsService } from './sales/promotions/promotions.service';

import { QueryOrderDto } from './sales/orders/dto/query-order.dto';
import { CreateOrderDto } from './sales/orders/dto/create-order.dto';
import { UpdateOrderStatusDto } from './sales/orders/dto/update-order-status.dto';

import { CartItemInputDto, UpdateCartItemDto } from './sales/cart/dto/cart.dto';

import { CreateStockOutDto } from './sales/stock-out/dto/create-stock-out.dto';
import { UpdateStockOutDto } from './sales/stock-out/dto/update-stock-out.dto';
import { FindStockOutQueryDto } from './sales/stock-out/dto/find-stock-out-query.dto';

import {
  CreatePromotionDto,
  UpdatePromotionDto,
} from './sales/promotions/dto/promotion.dto';

@Controller()
export class SalesServiceController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
    private readonly stockOutService: StockOutService,
    private readonly promotionsService: PromotionsService,
  ) {}

  @MessagePattern({ cmd: 'sales.health' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'sales-service',
      timestamp: new Date().toISOString(),
    };
  }

  // Orders
  @MessagePattern({ cmd: 'orders.find_all' })
  async findAllOrders(@Payload() query: QueryOrderDto) {
    return this.ordersService.getOrders(query || {});
  }

  @MessagePattern({ cmd: 'orders.find_my' })
  async findMyOrders(@Payload() query: QueryOrderDto & { userId: string }) {
    return this.ordersService.getMyOrders(query.userId, query || {});
  }

  @MessagePattern({ cmd: 'orders.stats' })
  async getSalesStats(
    @Payload() query: { month?: string | number; year?: string | number },
  ) {
    return this.ordersService.getSalesStatistics(
      query?.month ? Number(query.month) : undefined,
      query?.year ? Number(query.year) : undefined,
    );
  }

  @MessagePattern({ cmd: 'orders.period_stats' })
  async getSalesStatsByPeriod(
    @Payload() query: { year?: string | number; quarter?: string | number },
  ) {
    return this.ordersService.getSalesStatisticsByPeriod(
      query?.year ? Number(query.year) : undefined,
      query?.quarter ? Number(query.quarter) : undefined,
    );
  }

  @MessagePattern({ cmd: 'orders.find_one' })
  async findOneOrder(@Payload() id: string) {
    return this.ordersService.getOrderById(id);
  }

  @MessagePattern({ cmd: 'orders.create_saga' })
  async createOrderSaga(@Payload() dto: CreateOrderDto & { userId: string }) {
    return this.ordersService.createOrder(dto?.userId || 'system', dto);
  }

  @MessagePattern({ cmd: 'orders.update_status' })
  async updateOrderStatus(
    @Payload() payload: { id: string; data: UpdateOrderStatusDto },
  ) {
    return this.ordersService.updateOrderStatus(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'orders.cancel' })
  async cancelOrder(@Payload() payload: { id: string }) {
    const id = typeof payload === 'string' ? payload : payload.id;
    return this.ordersService.cancelOrder(id);
  }

  // Cart
  @MessagePattern({ cmd: 'cart.get' })
  async getCart(@Payload() query: { userId: string }) {
    return this.cartService.getCart(query?.userId || 'system');
  }

  @MessagePattern({ cmd: 'cart.add_item' })
  async addToCart(@Payload() dto: CartItemInputDto & { userId: string }) {
    return this.cartService.addItem(dto?.userId || 'system', dto);
  }

  @MessagePattern({ cmd: 'cart.update_item' })
  async updateCartItem(
    @Payload()
    payload: {
      itemId: string;
      data: UpdateCartItemDto & { userId: string };
    },
  ) {
    return this.cartService.updateItem(
      payload.data?.userId || 'system',
      payload.itemId,
      payload.data,
    );
  }

  @MessagePattern({ cmd: 'cart.remove_item' })
  async removeCartItem(@Payload() itemId: string) {
    return this.cartService.removeItem('system', itemId);
  }

  @MessagePattern({ cmd: 'cart.clear' })
  async clearCart() {
    return this.cartService.clearCart('system');
  }

  // StockOuts
  @MessagePattern({ cmd: 'stock_outs.find_all' })
  async findAllStockOuts(@Payload() query: FindStockOutQueryDto) {
    return this.stockOutService.findAll(query || {});
  }

  @MessagePattern({ cmd: 'stock_outs.find_one' })
  async findOneStockOut(@Payload() id: string) {
    return this.stockOutService.findOne(id);
  }

  @MessagePattern({ cmd: 'stock_outs.create' })
  async createStockOut(@Payload() dto: CreateStockOutDto & { userId: string }) {
    return this.stockOutService.create(dto, dto?.userId || 'system');
  }

  @MessagePattern({ cmd: 'stock_outs.update' })
  async updateStockOut(
    @Payload() payload: { id: string; data: UpdateStockOutDto },
  ) {
    return this.stockOutService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'stock_outs.delete' })
  async deleteStockOut(@Payload() id: string) {
    return this.stockOutService.remove(id);
  }

  // Promotions
  @MessagePattern({ cmd: 'promotions.find_all' })
  async findAllPromotions() {
    return this.promotionsService.findAll();
  }

  @MessagePattern({ cmd: 'promotions.create' })
  async createPromotion(@Payload() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @MessagePattern({ cmd: 'promotions.update' })
  async updatePromotion(
    @Payload() payload: { id: string; data: UpdatePromotionDto },
  ) {
    return this.promotionsService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'promotions.delete' })
  async deletePromotion(@Payload() id: string) {
    return this.promotionsService.remove(id);
  }

  // Event Listeners
  @EventPattern('warehouse.stock_failed')
  async handleStockFailed(
    @Payload() payload: { orderId: string; reason: string },
  ) {
    return this.ordersService.handleStockFailed(
      payload.orderId,
      payload.reason,
    );
  }
}
