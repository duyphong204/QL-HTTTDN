import { Module } from '@nestjs/common';
import { SalesServiceController } from './sales-service.controller';
import { SalesModule } from './sales/sales.module';
import { PrismaModule } from '@app/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, SalesModule],
  controllers: [SalesServiceController],
})
export class SalesServiceAppModule {}

