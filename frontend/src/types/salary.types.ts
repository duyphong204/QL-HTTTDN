import type { BaseEntity } from "./common.types";

export const SalaryStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PAID: "PAID",
} as const;

export type SalaryStatus = (typeof SalaryStatus)[keyof typeof SalaryStatus];

export const DetailType = {
  BONUS: "BONUS",
  OT: "OT",
  ALLOWANCE: "ALLOWANCE",
  DEDUCTION: "DEDUCTION",
  INSURANCE: "INSURANCE",
  TAX: "TAX",
} as const;

export type DetailType = (typeof DetailType)[keyof typeof DetailType];

export interface SalaryDetail {
  id: string;
  type: DetailType;
  amount: number;
  description?: string | null;
}

export interface Employee {
  id: string;
  userId: string;
  code: string;
  position?: string | null;
  baseSalary: number;
  joinDate: string;
  resignDate?: string | null;
  department?: string | null;
  user: {
    id: string;
    email: string;
    profile?: {
      fullName?: string | null;
    } | null;
  };
}

export interface Salary extends BaseEntity {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
  actualWorkDays: number;
  unpaidDays: number;
  grossSalary: number;
  totalBonus: number;
  totalDeduction: number;
  netSalary: number;
  status: SalaryStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
  employee: Employee;
  details: SalaryDetail[];
}

export interface AddSalaryDetailDto {
  type: DetailType;
  amount: number;
  description?: string;
}

export interface QuerySalaryParams {
  month?: number;
  year?: number;
  employeeId?: string;
  status?: SalaryStatus;
  page?: number;
  limit?: number;
}

export type QuerySalaryDto = QuerySalaryParams;

export interface SalaryListResponse {
  data: Salary[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

