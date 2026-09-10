import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { PrismaModule } from '@app/common';
import { SalesReportService } from './services/sales-report.service';
import { WarehouseReportService } from './services/warehouse-report.service';
import { HrReportService } from './services/hr-report.service';

@Module({
  imports: [PrismaModule],
  providers: [SalesReportService, WarehouseReportService, HrReportService],
  controllers: [ReportController],
  exports: [SalesReportService, WarehouseReportService, HrReportService],
})
export class ReportModule {}
