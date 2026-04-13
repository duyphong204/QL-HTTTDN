export interface ChartDataset {
  name: string;
  data: number[];
  color?: string;
}

export interface RechartsChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ReportQuery {
  year?: number;
  month?: number;
  quarter?: number;
  period?: 'month' | 'quarter' | 'year';
}

export interface RoleReportResponse {
  period: Record<string, unknown>;
  summary: Record<string, unknown>;
  charts: Record<string, RechartsChartData>;
  lowStockProducts?: Array<{
    id: string;
    name: string;
    stockQuantity: number;
    minStock: number;
    alert?: string;
  }>;
  topProducts?: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salaryHistory?: Array<{
    id: string;
    month: number;
    year: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    totalSalary: number;
    status: string;
    employeeName: string;
  }>;
}
