import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { MomoService } from './momo.service';

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
  async getOrderPaymentStatus(@Query('orderId') orderId: string) {
    return this.momoService.getOrderPaymentStatus(orderId);
  }
}
