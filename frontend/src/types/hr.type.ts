export type {
  Employee,
  CreateEmployeeDto,
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
