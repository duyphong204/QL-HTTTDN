import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportQueryDto } from './dto/report.dto';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/common';
import { Roles } from '@app/common';
import { Role } from '@app/common/enums/role.enum';

import { SalesReportService } from './services/sales-report.service';
import { WarehouseReportService } from './services/warehouse-report.service';
import { HrReportService } from './services/hr-report.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.HR_MANAGER, Role.SALES_MANAGER, Role.WAREHOUSE_MANAGER)
@Controller('reports')
export class ReportController {
  constructor(
    private readonly salesReportService: SalesReportService,
    private readonly warehouseReportService: WarehouseReportService,
    private readonly hrReportService: HrReportService,
  ) {}

  @Get('sales')
  getSales(@Query() query: ReportQueryDto) {
    return this.salesReportService.getSalesReport(query);
  }

  @Get('warehouse')
  getWarehouse(@Query() query: ReportQueryDto) {
    return this.warehouseReportService.getWarehouseReport(query);
  }

  @Get('hr')
  getHr(@Query() query: ReportQueryDto) {
    return this.hrReportService.getHrReport(query);
  }
}


