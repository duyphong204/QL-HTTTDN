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
}

export interface CreateEmployeeDto {
    userId: string
    code: string
    department?: string
    position?: string
    baseSalary: number
    joinDate: Date
}

export interface UpdateEmployeeDto {
    code?: string
    department?: string
    position?: string
    baseSalary?: number
    resignDate?: Date
}

export interface JobHistory extends BaseEntity {
    employeeId: string
    employee?: Employee
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
}

export interface CreateSalaryDto {
    employeeId: string
    month: number
    year: number
    amount: number
    bonus?: number
    deduction?: number
}

export interface UpdateSalaryDto {
    amount?: number
    bonus?: number
    deduction?: number
    status?: "PAID" | "PENDING"
}

export interface LeaveRequest extends BaseEntity {
    employeeId: string
    employee?: Employee
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