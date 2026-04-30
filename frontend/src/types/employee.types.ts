import type { Role } from "./auth.types";
import type { BaseEntity } from "./common.types";
import type { User } from "./user.types";

export interface Employee extends BaseEntity {
  userId: string;
  user?: User;
  code: string;
  department?: string;
  position?: string;
  baseSalary: number;
  joinDate: Date;
  resignDate?: Date;
  jobHistories?: JobHistory[];
}

export interface CreateEmployeeDto {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
  department?: string;
  position?: string;
  baseSalary: number;
}


export interface ChangePositionDto {
  position?: string;
  department?: string;
  baseSalary?: number;
  effectiveDate: string;
  note?: string;
}

export interface UpdateEmployeeProfileByHrDto {
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  dateOfBirth?: string;
}

export interface QueryEmployeeDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "code" | "department" | "position" | "joinDate";
  sortOrder?: "asc" | "desc";
  department?: string;
  position?: string;
  isActive?: boolean;
}

export interface JobHistory extends BaseEntity {
  employeeId: string;
  department?: string;
  position?: string;
  baseSalary: number;
  startDate: Date;
  endDate?: Date;
}

export interface CreateJobHistoryDto {
  employeeId: string;
  department?: string;
  position?: string;
  baseSalary: number;
  startDate: Date;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  code: string;
  department?: string;
  position?: string;
  baseSalary: number;
  joinDate: Date;
  resignDate?: Date | undefined;
  user: User;
  jobHistories?: JobHistory[];
}

export interface UpdateMyProfileDto {
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  dateOfBirth?: string;
}
