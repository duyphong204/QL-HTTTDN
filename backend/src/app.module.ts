import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HRModule } from './modules/hr/hr.module';
import { LoggingMiddleware } from './middlware/logging/logging.middleware';
import { OrderModule } from './modules/sales/orders/order.module';
import { StockOutModule } from './modules/sales/stock-out/stock-out.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    WarehouseModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    HRModule,
    OrderModule,
    StockOutModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
