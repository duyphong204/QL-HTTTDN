import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HRModule } from './modules/hr/hr.module';
import { LoggingMiddleware } from './middlware/logging/logging.middleware';

@Module({
  imports: [WarehouseModule, PrismaModule, AuthModule, UsersModule, HRModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
