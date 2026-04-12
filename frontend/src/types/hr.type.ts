import type { Role } from "./auth.type"
import type { BaseEntity } from "./common.type"
import type { User } from "./user.type"

export interface Employee extends BaseEntity {
    userId: string
    user?: User
    code: string
    department?: string
    position?: string
    baseSalary: number
    joinDate: Date
    resignDate?: Date
    jobHistories?: JobHistory[]
}

export interface CreateEmployeeDto {
    email: string
    password: string
    fullName: string
    department?: string
    position?: string
    baseSalary: number
}

export interface UpdateEmployeeDto {
    department?: string
    position?: string
    baseSalary?: number
    role?: Role
    effectiveDate?: string
}

export interface QueryEmployeeDto {
    page?: number
    limit?: number
    search?: string
    sortBy?: 'code' | 'department' | 'position' | 'joinDate'
    sortOrder?: 'asc' | 'desc'
    department?: string
    position?: string
    isActive?: boolean
}

export interface JobHistory extends BaseEntity {
    employeeId: string
    // employee?: Employee
    department?: string
    position?: string
    baseSalary: number
    startDate: Date
    endDate?: Date
}

export interface CreateJobHistoryDto {
    employeeId: string
    department?: string
    position?: string
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
    netSalary?: number
}

export interface CreateSalaryDto {
    employeeId: string
    month: number
    year: number
    bonus?: number
    deduction?: number
    status?: 'PAID' | 'PENDING'
}

export interface UpdateSalaryDto {
    amount?: number
    bonus?: number
    deduction?: number
    status?: "PAID" | "PENDING"
}

export interface QuerySalaryDto {
    month?: number
    year?: number
    employeeId?: string
    status?: 'PAID' | 'PENDING'
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

export interface HrStatisticsReport {
    totalEmployees: number
    totalResigned: number
    headcount: number
    salaryMonth: number
    salaryYear: number
    totalSalaryPaid: number
    totalBonus: number
}

export interface QueryLeaveRequestDto {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    type?: 'SICK' | 'ANNUAL' | 'MATERNITY' | 'RESIGNATION'
    employeeId?: string
    year?: string
}
