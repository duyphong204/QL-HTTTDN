import type { BaseEntity } from "./common.types";
import type { User } from "./user.types";

export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "UNPAID" | "RESIGNATION";

export interface LeaveRequest extends BaseEntity {
  employeeId?: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  totalDays?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  approvedById?: string;
  approvedByUser?: User;
}

export interface CreateLeaveRequestDto {
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
}

export interface ApproveLeaveRequestDto {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface QueryLeaveRequestDto {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  type?: LeaveType;
  employeeId?: string;
  year?: string;
  month?: string;
}

export interface LeaveBalance {
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}
