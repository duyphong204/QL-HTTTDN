import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportQueryDto } from './dto/report.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.HR_MANAGER, Role.SALES_MANAGER, Role.WAREHOUSE_MANAGER)
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
