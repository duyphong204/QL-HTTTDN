import type { BaseEntity } from "./common.types";
import type { User } from "./user.types";

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
  period?: "month" | "quarter" | "year";
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

export interface SystemLog extends BaseEntity {
  userId?: string;
  user?: User;
  action: string;
  details?: string;
}

export interface SalaryReport {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalSalary: number;
  status: "PAID" | "PENDING";
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
}

export interface ProfitReport {
  period: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

export interface EmployeeStatistics {
  period: string;
  totalEmployees: number;
  newHires: number;
  resignations: number;
  totalSalaryExpense: number;
  averageSalary: number;
}

export interface StockReport {
  period: string;
  totalStockIn: number;
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
}

export interface WarehouseReport {
  period: {
    month?: number;
    year: number;
  };
  totalStockIns: number;
  totalImportValue: number;
  totalImportQuantity: number;
  totalProductTypes: number;
  totalStockQuantity: number;
  lowStockProducts: {
    id: string;
    name: string;
    stockQuantity: number;
    minStock: number;
  }[];
}

export interface MonthlyPayrollBreakdown {
  month: number;
  totalNetSalary: number;
  totalBonus: number;
  employeeCount: number;
}

export interface LeaveStatByType {
  type: string;
  _count: { id: number };
}

export interface HrStatisticsReport {
  totalEmployees: number;
  totalResigned: number;
  newThisMonth: number;
  resignedThisMonth: number;
  headcount: number;
  salaryMonth: number;
  salaryYear: number;
  totalSalaryPaid: number;
  totalBonus: number;
  totalDeduction: number;
  avgSalary: number;
  pendingLeaveRequests: number;
  monthlyBreakdown: MonthlyPayrollBreakdown[];
  leaveStatsByType: LeaveStatByType[];
}

export interface AdminDashboardReport {
  period: {
    month?: number;
    year: number;
  };
  generatedAt: string;
  sales: {
    totalOrders: number;
    totalItemsSold: number;
    totalRevenue: number;
    totalProfit: number;
  };
  warehouse: {
    totalStockIns: number;
    totalImportValue: number;
    totalImportQuantity: number;
    totalProductTypes: number;
    totalStockQuantity: number;
    lowStockProducts: {
      id: string;
      name: string;
      stockQuantity: number;
      minStock: number;
    }[];
  };
  hr: {
    totalEmployees: number;
    totalResigned: number;
    headcount: number;
    totalSalaryPaid: number;
    totalBonus: number;
  };
}
