import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getOrders(@Query() query: QueryOrderDto) {
    return this.ordersService.getOrders(query);
  }

  @Post()
  @Roles(Role.CUSTOMER)
  createOrder(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  @Post(':id/retry-payment')
  @Roles(Role.ADMIN, Role.SALES_MANAGER, Role.CUSTOMER)
  retryPayment(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.retryOrderPayment(req.user.id, id);
  }

  @Get('me')
  @Roles(Role.ADMIN, Role.SALES_MANAGER, Role.CUSTOMER)
  getMyOrders(@Request() req: any, @Query() query: QueryOrderDto) {
    return this.ordersService.getMyOrders(req.user.id, query);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getSalesStats(@Query('month') month?: string, @Query('year') year?: string) {
    return this.ordersService.getSalesStatistics(
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }

  @Get('stats/period')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getSalesStatsByPeriod(
    @Query('year') year?: string,
    @Query('quarter') quarter?: string,
  ) {
    return this.ordersService.getSalesStatisticsByPeriod(
      year ? +year : undefined,
      quarter ? +quarter : undefined,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  cancelOrder(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancelOrder(id);
  }
}


