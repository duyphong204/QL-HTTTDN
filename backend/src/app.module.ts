import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HRModule } from './modules/hr/hr.module';
import { LoggingMiddleware } from './middlware/logging/logging.middleware';
import { ReportModule } from './modules/report/report.module';
import { OrderModule } from './modules/sales/orders/order.module';
import { PaymentsModule } from './modules/sales/payments/payments.module';
import { PromotionsModule } from './modules/sales/promotions/promotions.module';
import { CartModule } from './modules/sales/cart/cart.module';
import { StockOutModule } from './modules/sales/stock-out/stock-out.module';
import { StockInModule } from './modules/warehouse/stock-in/stock-in.module';
@Module({
  imports: [
    WarehouseModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    HRModule,
    ReportModule,
    OrderModule,
    PaymentsModule,
    PromotionsModule,
    CartModule,
    StockOutModule,
    StockInModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
