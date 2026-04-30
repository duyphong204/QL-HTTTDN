import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ReportService } from './report.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('reports/admin')
  @Roles(Role.ADMIN)
  getAdminReport(@Query('year') year?: string, @Query('month') month?: string) {
    return this.reportService.getAdminDashboard({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  // Backward-compatible endpoint currently used by frontend.
  @Get('admin/dashboard-report')
  @Roles(Role.ADMIN)
  getAdminReportLegacy(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportService.getAdminDashboardLegacy({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  @Get('reports/hr')
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  getHrManagerReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportService.getHrManagerReport({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  @Get('reports/warehouse')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  getWarehouseManagerReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportService.getWarehouseManagerReport({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  // Backward-compatible endpoint currently used by frontend service.
  @Get('warehouse/report')
  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  getWarehouseLegacyReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportService.getWarehouseLegacyReport({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  @Get('reports/sales')
  @Roles(Role.ADMIN, Role.SALES_MANAGER)
  getSalesManagerReport(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('period') period?: 'month' | 'quarter' | 'year',
  ) {
    return this.reportService.getSalesManagerReport({
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      quarter: quarter ? Number(quarter) : undefined,
      period,
    });
  }

  @Get('reports/employee/salary')
  @Roles(Role.EMPLOYEE, Role.ADMIN, Role.HR_MANAGER)
  getEmployeeSalaryReport(
    @Request() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportService.getEmployeeSalaryReport(req.user.id, {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }
}
