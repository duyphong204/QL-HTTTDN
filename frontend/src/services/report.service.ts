import { apiGet } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { ReportQuery, RoleReportResponse } from "@/types/report.types";

export const reportService = {
  getAdminReport: async (params?: ReportQuery): Promise<RoleReportResponse> => {
    return apiGet<RoleReportResponse>(endpoints.reports.admin, params);
  },

  getHrReport: async (params?: ReportQuery): Promise<RoleReportResponse> => {
    return apiGet<RoleReportResponse>(endpoints.reports.hr, params);
  },

  getWarehouseReport: async (
    params?: ReportQuery,
  ): Promise<RoleReportResponse> => {
    return apiGet<RoleReportResponse>(endpoints.reports.warehouse, params);
  },

  getSalesReport: async (params?: ReportQuery): Promise<RoleReportResponse> => {
    return apiGet<RoleReportResponse>(endpoints.reports.sales, params);
  },

  getEmployeeSalaryReport: async (
    params?: Pick<ReportQuery, "year" | "month">,
  ): Promise<RoleReportResponse> => {
    return apiGet<RoleReportResponse>(endpoints.reports.employeeSalary, params);
  },
};
