import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sales - Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Get('vnpay/verify-return')
  async verifyReturn(@Query() query: Record<string, string>) {
    const result = await this.vnpayService.processReturn(query);

    return {
      success: result.paid,
      orderId: result.orderId,
      paymentStatus: result.paid ? 'PAID' : 'FAILED',
      responseCode: result.responseCode,
      transactionStatus: result.transactionStatus,
      message: result.paid
        ? 'Thanh toán thành công'
        : 'Thanh toán thất bại hoặc bị hủy',
    };
  }

  @Get('vnpay/ipn')
  async ipn(@Query() query: Record<string, string>) {
    try {
      await this.vnpayService.processReturn(query);
      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return { RspCode: '97', Message: 'Invalid signature or data' };
      }
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  @Get('order-status')
  async getOrderPaymentStatus(@Query('orderId') orderId: string) {
    return this.vnpayService.getOrderPaymentStatus(orderId);
  }
}
