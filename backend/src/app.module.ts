import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HRModule } from './modules/hr/hr.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportModule } from './modules/report/report.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    HRModule,
    WarehouseModule,
    SalesModule,
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
