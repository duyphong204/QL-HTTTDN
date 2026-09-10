import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { SalesReportService } from './report/services/sales-report.service';
import { WarehouseReportService } from './report/services/warehouse-report.service';
import { HrReportService } from './report/services/hr-report.service';

@Controller()
export class ReportServiceController {
  constructor(
    private readonly salesReportService: SalesReportService,
    private readonly warehouseReportService: WarehouseReportService,
    private readonly hrReportService: HrReportService,
  ) {}

  @MessagePattern({ cmd: 'report.health' })
  healthCheck() {
    return { status: 'ok', service: 'report-service', timestamp: new Date().toISOString() };
  }

  @MessagePattern({ cmd: 'reports.sales_summary' })
  async getSalesSummary(@Payload() query: any) {
    return this.salesReportService.getSalesReport(query || {});
  }

  @MessagePattern({ cmd: 'reports.warehouse_summary' })
  async getWarehouseSummary(@Payload() query: any) {
    return this.warehouseReportService.getWarehouseReport(query || {});
  }

  @MessagePattern({ cmd: 'reports.hr_summary' })
  async getHrSummary(@Payload() query: any) {
    return this.hrReportService.getHrReport(query || {});
  }

  // Non-blocking Event Handler from Async Event Bus (RabbitMQ)
  @EventPattern('order.created')
  async handleOrderCreatedEvent(@Payload() order: any) {
    // Analytics update happens here in background
    return { status: 'event_processed', event: 'order.created', orderId: order?.id };
  }
}

