import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ReportServiceController } from './report-service.controller';
import { ReportModule } from './report/report.module';
import { PrismaModule } from '@app/common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ReportModule,
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
  ],
  controllers: [ReportServiceController],
})
export class ReportServiceAppModule {}
