export type ReportType = "month" | "quarter" | "year";

export interface ReportQuery {
  type: ReportType;
  year: number;
  month?: number;
  quarter?: number;
}

export interface SalesReportSummary {
  revenue: number;
  profit: number;
  totalSoldQuantity: number;
}

export interface SalesSeriesPoint {
  time: string;
  revenue: number;
  profit: number;
  quantity: number;
}

export interface SalesReport {
  summary: SalesReportSummary;
  breakdown: SalesSeriesPoint[];
}

export interface WarehouseReportSummary {
  totalImportAmount: number;
  totalExportAmount: number;
  totalInventory: number;
  totalImportQuantity: number;
  totalExportQuantity: number;
}

export interface WarehouseSeriesPoint {
  time: string;
  import: number;
  export: number;
}

export interface WarehouseReport {
  summary: WarehouseReportSummary;
  breakdown: WarehouseSeriesPoint[];
}

export interface HrReportSummary {
  totalSalary: number;
  totalBonus: number;
  totalDeduction: number;
  activeEmployees: number;
  resignedEmployees: number;
}

export interface HrSeriesPoint {
  time: string;
  salary: number;
  bonus: number;
  deduction: number;
}

export interface HrReport {
  summary: HrReportSummary;
  breakdown: HrSeriesPoint[];
}

export interface HrLeaveStat {
  type: string;
  _count: number;
}

export interface SalesChartPoint {
  label: string;
  revenue: number;
  profit: number;
  quantity: number;
}

export interface WarehouseChartPoint {
  label: string;
  importAmount: number;
  exportAmount: number;
}
