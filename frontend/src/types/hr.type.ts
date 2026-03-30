import type { BaseEntity } from "./common.type"
import type { Role } from "./auth.type"
import type { User } from "./user.type"

export interface Employee extends BaseEntity {
    userId: string
    user?: User
    code: string
    department?: string
    position?: Role
    baseSalary: number
    joinDate: Date
    resignDate?: Date
    jobHistories?: JobHistory[]
}

export interface CreateEmployeeDto {
    email: string
    password: string
    fullName: string
    phone?: string
    department?: string
    position?: Role
    baseSalary: number
}

export interface UpdateProfileDto {
    fullName?: string;
    phone?: string;
    address?: string;
    position?: Role;
    department?: string;
}

export interface UpdateEmployeeDto {
    code?: string
    department?: string
    position?: Role
    baseSalary?: number
    resignDate?: Date
}

export interface JobHistory extends BaseEntity {
    employeeId: string
    employee?: Employee
    department?: string
    position?: Role
    baseSalary: number
    startDate: Date
    endDate?: Date
}

export interface CreateJobHistoryDto {
    employeeId: string
    department?: string
    position?: Role
    baseSalary: number
    startDate: Date
}

export interface Salary extends BaseEntity {
    employeeId: string
    employee?: Employee
    month: number
    year: number
    amount: number
    bonus: number
    deduction: number
    status: "PAID" | "PENDING"
}

export interface CreateSalaryDto {
    employeeId: string
    month: number
    year: number
    bonus?: number
    deduction?: number
    status: 'PAID' | 'PENDING'
}

export interface UpdateSalaryDto {
    amount?: number
    bonus?: number
    deduction?: number
    status?: "PAID" | "PENDING"
}

export interface LeaveRequest extends BaseEntity {
    employeeId?: string
    employeeName?: string
    startDate: string
    endDate: string
    type: "SICK" | "ANNUAL" | "MATERNITY" | "RESIGNATION"
    reason: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    approvedById?: string
    approvedByUser?: User
}

export interface CreateLeaveRequestDto {
    startDate: string
    endDate: string
    type: "SICK" | "ANNUAL" | "MATERNITY" | "RESIGNATION"
    reason: string
}

export interface ApproveLeaveRequestDto {
    status: "APPROVED" | "REJECTED"
}