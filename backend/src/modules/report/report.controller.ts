import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportQueryDto } from './dto/report.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales')
  getSales(@Query() query: ReportQueryDto) {
    return this.reportService.getSalesReport(query);
  }

  @Get('warehouse')
  getWarehouse(@Query() query: ReportQueryDto) {
    return this.reportService.getWarehouseReport(query);
  }

  @Get('hr')
  getHr(@Query() query: ReportQueryDto) {
    return this.reportService.getHrReport(query);
  }
}
