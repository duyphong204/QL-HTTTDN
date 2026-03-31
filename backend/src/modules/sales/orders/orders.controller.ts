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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sales - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Post()
  @Roles(Role.ADMIN, Role.SALES_MANAGER, Role.CUSTOMER)
  createOrder(@Body() dto: CreateOrderDto, @Request() req: any) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.ip ||
      '127.0.0.1';
    return this.ordersService.createOrder(req.user.id, dto, clientIp);
  }

  @Get('me')
  @Roles(Role.ADMIN, Role.SALES_MANAGER, Role.CUSTOMER)
  getMyOrders(@Request() req: any) {
    return this.ordersService.getMyOrders(req.user.id);
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
  cancelOrder(@Param('id') id: string, @Body() _dto: CancelOrderDto) {
    return this.ordersService.cancelOrder(id);
  }

  @Get('statistics/report')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getSalesStatistics(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.ordersService.getSalesStatistics(
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }
}
