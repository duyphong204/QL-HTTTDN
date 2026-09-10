import { Module } from '@nestjs/common';
import { HrServiceController } from './hr-service.controller';
import { HRModule } from './hr/hr.module';
import { PrismaModule } from '@app/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, HRModule],
  controllers: [HrServiceController],
})
export class HrServiceAppModule {}

