import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
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
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles(Role.ADMIN, Role.SALES_MANAGER)
    createOrder(@Body() dto: CreateOrderDto, @Request() req: any) {
        return this.ordersService.createOrder(req.user.id, dto);
    }

    @Get('statistics/report')
    @Roles(Role.ADMIN, Role.SALES_MANAGER)
    getSalesStatistics(@Query('month') month?: string, @Query('year') year?: string) {
        return this.ordersService.getSalesStatistics(month ? +month : undefined, year ? +year : undefined);
    }
    @Get('stats')
    @Roles(Role.ADMIN, Role.SALES_MANAGER)
    getStats(
        @Query('month') month?: string,
        @Query('year') year?: string,
    ) {
        return this.ordersService.getSalesStatistics(
            month ? Number(month) : undefined,
            year ? Number(year) : undefined,
        );
    }
    @Get('period')
    @Roles(Role.ADMIN, Role.SALES_MANAGER)
    getByPeriod(@Query('year') year: string, @Query('quarter') quarter?: string) {
        return this.ordersService.getOrdersByPeriod(
            Number(year),
            quarter ? Number(quarter) : undefined,
        );
    }
}
