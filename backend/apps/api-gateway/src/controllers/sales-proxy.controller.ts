import { Controller, Get, Post, Patch, Delete, Param, Query, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SALES_SERVICE, Public } from '@app/common';
import { firstValueFrom } from 'rxjs';

import { QueryOrderDto } from '../../../sales-service/src/sales/orders/dto/query-order.dto';
import { CreateOrderDto } from '../../../sales-service/src/sales/orders/dto/create-order.dto';
import { UpdateOrderStatusDto } from '../../../sales-service/src/sales/orders/dto/update-order-status.dto';

import { CartItemInputDto, UpdateCartItemDto } from '../../../sales-service/src/sales/cart/dto/cart.dto';

import { CreateStockOutDto } from '../../../sales-service/src/sales/stock-out/dto/create-stock-out.dto';
import { UpdateStockOutDto } from '../../../sales-service/src/sales/stock-out/dto/update-stock-out.dto';
import { FindStockOutQueryDto } from '../../../sales-service/src/sales/stock-out/dto/find-stock-out-query.dto';

@Controller()
export class SalesProxyController {
  constructor(
    @Inject(SALES_SERVICE) private readonly salesClient: ClientProxy,
  ) {}

  // Orders
  @Public()
  @Get('orders')
  async getOrders(@Query() query: QueryOrderDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.find_all' }, query));
  }

  @Get('orders/my')
  async getMyOrders(@Query() query: QueryOrderDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.find_my' }, query));
  }

  @Get('orders/stats')
  async getSalesStats(@Query() query: { month?: string; year?: string }) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.stats' }, query));
  }

  @Get('orders/period')
  async getSalesStatsByPeriod(@Query() query: { year?: string; quarter?: string }) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.period_stats' }, query));
  }

  @Public()
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.find_one' }, id));
  }

  @Public()
  @Post('orders')
  async createOrderSaga(@Body() dto: CreateOrderDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.create_saga' }, dto));
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.update_status' }, { id, data: body }));
  }

  @Patch('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.salesClient.send({ cmd: 'orders.cancel' }, { id, data: body }));
  }

  // Cart
  @Get('cart')
  async getCart(@Query() query: any) {
    return firstValueFrom(this.salesClient.send({ cmd: 'cart.get' }, query));
  }

  @Post('cart/items')
  async addToCart(@Body() dto: CartItemInputDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'cart.add_item' }, dto));
  }

  @Patch('cart/items/:itemId')
  async updateCartItem(@Param('itemId') itemId: string, @Body() body: UpdateCartItemDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'cart.update_item' }, { itemId, data: body }));
  }

  @Delete('cart/items/:itemId')
  async removeCartItem(@Param('itemId') itemId: string) {
    return firstValueFrom(this.salesClient.send({ cmd: 'cart.remove_item' }, itemId));
  }

  @Post('cart/clear')
  async clearCart() {
    return firstValueFrom(this.salesClient.send({ cmd: 'cart.clear' }, {}));
  }

  // StockOuts
  @Get('stock-outs')
  async getStockOuts(@Query() query: FindStockOutQueryDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'stock_outs.find_all' }, query));
  }

  @Get('stock-outs/:id')
  async getStockOutById(@Param('id') id: string) {
    return firstValueFrom(this.salesClient.send({ cmd: 'stock_outs.find_one' }, id));
  }

  @Post('stock-outs')
  async createStockOut(@Body() dto: CreateStockOutDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'stock_outs.create' }, dto));
  }

  @Patch('stock-outs/:id')
  async updateStockOut(@Param('id') id: string, @Body() body: UpdateStockOutDto) {
    return firstValueFrom(this.salesClient.send({ cmd: 'stock_outs.update' }, { id, data: body }));
  }

  @Delete('stock-outs/:id')
  async deleteStockOut(@Param('id') id: string) {
    return firstValueFrom(this.salesClient.send({ cmd: 'stock_outs.delete' }, id));
  }
}
