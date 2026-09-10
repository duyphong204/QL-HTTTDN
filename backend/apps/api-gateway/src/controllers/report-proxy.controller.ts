import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REPORT_SERVICE, Public } from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller('reports')
export class ReportProxyController {
  constructor(
    @Inject(REPORT_SERVICE) private readonly reportClient: ClientProxy,
  ) {}

  @Public()
  @Get('sales')
  async getSalesReport(@Query() query: any) {
    return firstValueFrom(this.reportClient.send({ cmd: 'reports.sales_summary' }, query));
  }

  @Public()
  @Get('warehouse')
  async getWarehouseReport(@Query() query: any) {
    return firstValueFrom(this.reportClient.send({ cmd: 'reports.warehouse_summary' }, query));
  }

  @Public()
  @Get('hr')
  async getHrReport(@Query() query: any) {
    return firstValueFrom(this.reportClient.send({ cmd: 'reports.hr_summary' }, query));
  }
}
