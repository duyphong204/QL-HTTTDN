import { Module } from '@nestjs/common';
import { WarehouseServiceController } from './warehouse-service.controller';
import { WarehouseModule } from './warehouse/warehouse.module';
import { PrismaModule } from '@app/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, WarehouseModule],
  controllers: [WarehouseServiceController],
})
export class WarehouseServiceAppModule {}

