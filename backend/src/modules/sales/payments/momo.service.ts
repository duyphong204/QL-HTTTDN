import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import * as https from 'https';

type MomoCreatePaymentInput = {
  orderId: string;
  amount: number;
  orderInfo: string;
};

type MomoReturnParams = Record<string, string | undefined>;

@Injectable()
export class MomoService {
  constructor(private prisma: PrismaService) {}

  ensureConfigured() {
    this.getConfig();
  }

  private getConfig() {
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
    const secretKey =
      process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const endpoint =
      process.env.MOMO_ENDPOINT ||
      'https://test-payment.momo.vn/v2/gateway/api/create';
    const redirectUrl =
      process.env.MOMO_REDIRECT_URL ||
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-return`;
    const ipnUrl =
      process.env.MOMO_IPN_URL ||
      `${process.env.SERVER_URL || 'http://localhost:3000'}/payments/momo/ipn`;
    const requestType = process.env.MOMO_REQUEST_TYPE || 'payWithMethod';

    return {
      partnerCode,
      accessKey,
      secretKey,
      endpoint,
      redirectUrl,
      ipnUrl,
      requestType,
    };
  }

  private hmacSha256(raw: string, secretKey: string) {
    return crypto.createHmac('sha256', secretKey).update(raw).digest('hex');
  }

  private buildGatewayOrderId(orderId: string) {
    // MoMo requires orderId to be unique for each create payment request.
    return `${orderId}-${Date.now()}`;
  }

  private encodeExtraData(orderId: string) {
    return Buffer.from(JSON.stringify({ orderId }), 'utf-8').toString('base64');
  }

  private decodeOrderIdFromExtraData(extraData?: string) {
    if (!extraData) {
      return null;
    }

    try {
      const decoded = Buffer.from(extraData, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded) as { orderId?: string };
      return parsed.orderId || null;
    } catch {
      return null;
    }
  }

  private buildCreateSignature(input: {
    accessKey: string;
    amount: string;
    extraData: string;
    ipnUrl: string;
    orderId: string;
    orderInfo: string;
    partnerCode: string;
    redirectUrl: string;
    requestId: string;
    requestType: string;
  }) {
    return `accessKey=${input.accessKey}&amount=${input.amount}&extraData=${input.extraData}&ipnUrl=${input.ipnUrl}&orderId=${input.orderId}&orderInfo=${input.orderInfo}&partnerCode=${input.partnerCode}&redirectUrl=${input.redirectUrl}&requestId=${input.requestId}&requestType=${input.requestType}`;
  }

  private buildReturnSignature(params: MomoReturnParams, accessKey: string) {
    const amount = params.amount || '';
    const extraData = params.extraData || '';
    const message = params.message || '';
    const orderId = params.orderId || '';
    const orderInfo = params.orderInfo || '';
    const orderType = params.orderType || '';
    const partnerCode = params.partnerCode || '';
    const payType = params.payType || '';
    const requestId = params.requestId || '';
    const responseTime = params.responseTime || '';
    const resultCode = params.resultCode || '';
    const transId = params.transId || '';

    return `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
  }

  private postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
    const payload = JSON.stringify(body);
    const endpoint = new URL(url);

    return new Promise<T>((resolve, reject) => {
      const req = https.request(
        {
          hostname: endpoint.hostname,
          port: endpoint.port || 443,
          path: `${endpoint.pathname}${endpoint.search}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as T;
              resolve(parsed);
            } catch {
              reject(
                new BadRequestException('MoMo tra ve du lieu khong hop le'),
              );
            }
          });
        },
      );

      req.on('error', (error) => {
        reject(
          new BadRequestException(`Khong the ket noi MoMo: ${error.message}`),
        );
      });

      req.write(payload);
      req.end();
    });
  }

  async createPaymentUrl(input: MomoCreatePaymentInput): Promise<string> {
    const {
      partnerCode,
      accessKey,
      secretKey,
      endpoint,
      redirectUrl,
      ipnUrl,
      requestType,
    } = this.getConfig();

    const amount = `${Math.round(input.amount)}`;
    const gatewayOrderId = this.buildGatewayOrderId(input.orderId);
    const requestId = `${partnerCode}-${Date.now()}-${input.orderId}`;
    const extraData = this.encodeExtraData(input.orderId);

    const rawSignature = this.buildCreateSignature({
      accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId: gatewayOrderId,
      orderInfo: input.orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      requestType,
    });

    const signature = this.hmacSha256(rawSignature, secretKey);

    const body = {
      partnerCode,
      partnerName: process.env.MOMO_PARTNER_NAME || 'TechStore',
      storeId: process.env.MOMO_STORE_ID || 'TechStoreLocal',
      requestId,
      amount,
      orderId: gatewayOrderId,
      orderInfo: input.orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    const response = await this.postJson<{
      resultCode: number;
      message?: string;
      payUrl?: string;
      deeplink?: string;
      qrCodeUrl?: string;
    }>(endpoint, body);

    if (response.resultCode !== 0) {
      throw new BadRequestException(
        response.message || 'MoMo khong tao duoc lien ket thanh toan',
      );
    }

    const paymentUrl =
      response.payUrl || response.deeplink || response.qrCodeUrl;
    if (!paymentUrl) {
      throw new BadRequestException('MoMo khong tra ve duong dan thanh toan');
    }

    return paymentUrl;
  }

  verifySignature(params: MomoReturnParams) {
    const { accessKey, secretKey } = this.getConfig();
    const providedSignature = params.signature;

    if (!providedSignature) {
      return false;
    }

    const raw = this.buildReturnSignature(params, accessKey);
    const expected = this.hmacSha256(raw, secretKey);
    return expected.toLowerCase() === providedSignature.toLowerCase();
  }

  async processReturn(params: MomoReturnParams) {
    const mappedOrderId =
      this.decodeOrderIdFromExtraData(params.extraData) || params.orderId;

    if (!mappedOrderId) {
      throw new BadRequestException('Thieu ma don hang orderId');
    }

    if (!this.verifySignature(params)) {
      throw new BadRequestException('Sai chu ky xac thuc tu MoMo');
    }

    const resultCode = Number(params.resultCode || '99');
    const paid = resultCode === 0;

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: mappedOrderId },
        include: { details: true },
      });

      if (!order) {
        throw new BadRequestException('Khong tim thay don hang can cap nhat');
      }

      if (paid) {
        if (order.paymentStatus !== 'PAID') {
          for (const detail of order.details) {
            const stockUpdate = await tx.product.updateMany({
              where: {
                id: detail.productId,
                stockQuantity: { gte: detail.quantity },
              },
              data: {
                stockQuantity: {
                  decrement: detail.quantity,
                },
              },
            });

            if (stockUpdate.count === 0) {
              throw new BadRequestException(
                `San pham ${detail.productId} khong du ton kho de xac nhan don`,
              );
            }
          }
        }

        await tx.order.update({
          where: { id: mappedOrderId },
          data: { paymentStatus: 'PAID' },
        });
        return;
      }

      if (order.paymentStatus !== 'PAID') {
        await tx.order.update({
          where: { id: mappedOrderId },
          data: { paymentStatus: 'FAILED' },
        });
      }
    });

    return {
      orderId: mappedOrderId,
      paid,
      resultCode,
      transId: params.transId,
      message:
        params.message ||
        (paid ? 'Thanh toan thanh cong' : 'Thanh toan that bai'),
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
      throw new BadRequestException('Khong tim thay don hang');
    }

    return order;
  }
}
