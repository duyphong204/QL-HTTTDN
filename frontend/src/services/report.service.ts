import { apiGet } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  HrReport,
  ReportQuery,
  SalesReport,
  WarehouseReport,
} from "@/types/report.type";

export const reportService = {
  getSales: (query: ReportQuery) =>
    apiGet<SalesReport>(endpoints.reports.sales, query),

  getWarehouse: (query: ReportQuery) =>
    apiGet<WarehouseReport>(endpoints.reports.warehouse, query),

  getHr: (query: ReportQuery) =>
    apiGet<HrReport>(endpoints.reports.hr, query),
};
