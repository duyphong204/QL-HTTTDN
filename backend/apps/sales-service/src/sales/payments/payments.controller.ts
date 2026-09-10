import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MomoService } from './momo.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common/enums/role.enum';
import { OrderStatusQueryDto } from './dto/order-status.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly momoService: MomoService) {}

  @Get('momo/verify-return')
  async verifyReturn(@Query() query: Record<string, string>) {
    const result = await this.momoService.processReturn(query);

    return {
      success: result.paid,
      orderId: result.orderId,
      paymentStatus: result.paid ? 'PAID' : 'FAILED',
      resultCode: result.resultCode,
      transId: result.transId,
      message: result.message,
    };
  }

  @Get('momo/ipn')
  async ipn(@Query() query: Record<string, string>) {
    try {
      await this.momoService.processReturn(query);
      return { resultCode: 0, message: 'Confirm Success' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return { resultCode: 97, message: 'Invalid signature or data' };
      }
      return { resultCode: 99, message: 'Unknown error' };
    }
  }

  @Post('momo/ipn')
  async ipnPost(@Body() body: Record<string, string>) {
    try {
      await this.momoService.processReturn(body);
      return { resultCode: 0, message: 'Confirm Success' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return { resultCode: 97, message: 'Invalid signature or data' };
      }
      return { resultCode: 99, message: 'Unknown error' };
    }
  }

  @Get('order-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES_MANAGER, Role.CUSTOMER)
  async getOrderPaymentStatus(
    @Query() query: OrderStatusQueryDto,
    @Request() req: any,
  ) {
    return this.momoService.getOrderPaymentStatus(query.orderId, req.user);
  }
}
