export type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  JobHistory,
  CreateJobHistoryDto,
  EmployeeProfile,
  UpdateMyProfileDto,
} from "./employee.types";
export type {
  LeaveRequest,
  CreateLeaveRequestDto,
  ApproveLeaveRequestDto,
  QueryLeaveRequestDto,
} from "./leave.types";
import type { SalaryStatus } from "./salary.types";

export type {
  Salary,
  SalaryStatus,
  DetailType,
  SalaryDetail,
  AddSalaryDetailDto,
  QuerySalaryParams,
  QuerySalaryDto,
  SalaryListResponse,
  SalaryStatistics,
  MonthlyReport,
  YearlyReport,
} from "./salary.types";
export type {
  HrStatisticsReport,
  EmployeeStatistics,
  SalaryReport,
  AdminDashboardReport,
  WarehouseReport,
  RevenueReport,
  ProfitReport,
  StockReport,
  RoleReportResponse,
  ChartDataset,
  RechartsChartData,
  SystemLog,
  ReportQuery,
} from "./report.types";

export type CreateSalaryDto = {
  employeeId: string;
  month: number;
  year: number;
  baseSalary?: number;
  workingDays?: number;
  actualWorkDays?: number;
  grossSalary?: number;
  totalBonus?: number;
  totalDeduction?: number;
  netSalary?: number;
  note?: string;
};

export type UpdateSalaryDto = Partial<CreateSalaryDto> & {
  status?: SalaryStatus;
};
