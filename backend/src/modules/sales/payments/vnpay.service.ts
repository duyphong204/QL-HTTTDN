import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

type VnpParams = Record<string, string>;

type CreatePaymentUrlInput = {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr?: string;
};

@Injectable()
export class VnpayService {
  constructor(private prisma: PrismaService) {}

  ensureConfigured() {
    this.getConfig();
  }

  private getConfig() {
    const tmnCode = process.env.VNP_TMNCODE || process.env.VNP_TMN_CODE;
    const hashSecret =
      process.env.VNP_HASHSECRET || process.env.VNP_HASH_SECRET;
    const vnpUrl =
      process.env.VNP_URL ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl =
      process.env.VNP_RETURN_URL ||
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-return`;

    if (!tmnCode || !hashSecret) {
      throw new BadRequestException(
        'Thiếu cấu hình VNPAY: VNP_TMNCODE và VNP_HASHSECRET',
      );
    }

    return { tmnCode, hashSecret, vnpUrl, returnUrl };
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    const hh = `${date.getHours()}`.padStart(2, '0');
    const mm = `${date.getMinutes()}`.padStart(2, '0');
    const ss = `${date.getSeconds()}`.padStart(2, '0');
    return `${y}${m}${d}${hh}${mm}${ss}`;
  }

  private encode(value: string): string {
    return encodeURIComponent(value).replace(/%20/g, '+');
  }

  private buildQuery(params: VnpParams): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${this.encode(key)}=${this.encode(params[key])}`)
      .join('&');
  }

  private hmac(data: string, secret: string): string {
    return crypto
      .createHmac('sha512', secret)
      .update(Buffer.from(data, 'utf-8'))
      .digest('hex');
  }

  createPaymentUrl(input: CreatePaymentUrlInput): string {
    const { tmnCode, hashSecret, vnpUrl, returnUrl } = this.getConfig();

    const createDate = this.formatDate(new Date());
    const expireDate = this.formatDate(new Date(Date.now() + 15 * 60 * 1000));
    const amount = Math.round(input.amount * 100);

    const params: VnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: input.orderId,
      vnp_OrderInfo: input.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: `${amount}`,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: input.ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const signData = this.buildQuery(params);
    const secureHash = this.hmac(signData, hashSecret);
    return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
  }

  verifySignature(vnpParams: Record<string, string>) {
    const { hashSecret } = this.getConfig();

    const secureHash = vnpParams.vnp_SecureHash;
    if (!secureHash) {
      return false;
    }

    const clone: VnpParams = { ...vnpParams };
    delete clone.vnp_SecureHash;
    delete clone.vnp_SecureHashType;

    const signData = this.buildQuery(clone);
    const signed = this.hmac(signData, hashSecret);
    return signed.toLowerCase() === secureHash.toLowerCase();
  }

  async processReturn(vnpParams: Record<string, string>) {
    const isValidSignature = this.verifySignature(vnpParams);
    if (!isValidSignature) {
      throw new BadRequestException('Sai chữ ký xác thực từ VNPAY');
    }

    const orderId = vnpParams.vnp_TxnRef;
    if (!orderId) {
      throw new BadRequestException('Thiếu mã đơn hàng vnp_TxnRef');
    }

    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionStatus = vnpParams.vnp_TransactionStatus;
    const paid = responseCode === '00' && transactionStatus === '00';

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          details: true,
        },
      });

      if (!order) {
        throw new BadRequestException(
          'Không tìm thấy đơn hàng cần cập nhật thanh toán',
        );
      }

      if (paid) {
        if (order.paymentStatus !== 'PAID') {
          // Decrement stock when online payment is confirmed.
          for (const detail of order.details) {
            const stockUpdate = await tx.product.updateMany({
              where: {
                id: detail.productId,
                stockQuantity: {
                  gte: detail.quantity,
                },
              },
              data: {
                stockQuantity: {
                  decrement: detail.quantity,
                },
              },
            });

            if (stockUpdate.count === 0) {
              throw new BadRequestException(
                `Sản phẩm ${detail.productId} không đủ tồn kho để xác nhận đơn`,
              );
            }
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
          },
        });
      } else {
        if (order.paymentStatus === 'PAID') {
          return;
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
          },
        });
      }
    });

    return {
      orderId,
      paid,
      responseCode,
      transactionStatus,
    };
  }

  async getOrderPaymentStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng');
    }

    return order;
  }
}
