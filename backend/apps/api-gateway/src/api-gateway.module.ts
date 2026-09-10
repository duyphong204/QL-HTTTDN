import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { AuthProxyController } from './controllers/auth-proxy.controller';
import { WarehouseProxyController } from './controllers/warehouse-proxy.controller';
import { SalesProxyController } from './controllers/sales-proxy.controller';
import { HrProxyController } from './controllers/hr-proxy.controller';
import { ReportProxyController } from './controllers/report-proxy.controller';
import { PromotionsProxyController } from './controllers/promotions-proxy.controller';
import {
  AUTH_SERVICE,
  HR_SERVICE,
  WAREHOUSE_SERVICE,
  SALES_SERVICE,
  REPORT_SERVICE,
  LoggingMiddleware,
} from '@app/common';

import { AuthMiddleware } from './middleware/auth.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
        },
      },
      {
        name: HR_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.HR_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.HR_SERVICE_PORT) || 3002,
        },
      },
      {
        name: WAREHOUSE_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.WAREHOUSE_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.WAREHOUSE_SERVICE_PORT) || 3003,
        },
      },
      {
        name: SALES_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.SALES_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.SALES_SERVICE_PORT) || 3004,
        },
      },
      {
        name: REPORT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.REPORT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.REPORT_SERVICE_PORT) || 3005,
        },
      },
    ]),
  ],
  controllers: [
    ApiGatewayController,
    AuthProxyController,
    WarehouseProxyController,
    SalesProxyController,
    HrProxyController,
    ReportProxyController,
    PromotionsProxyController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware, AuthMiddleware).forRoutes('*');
  }
}
