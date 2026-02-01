import type { BaseEntity } from "./common.type"
export interface Employee extends BaseEntity {
    code: string
    department?: string
    position?: string
    baseSalary: number
    joinDate: string
    resignDate?: string
}

export interface JobHistory extends BaseEntity {
    department?: string
    position?: string
    baseSalary: number
    startDate: string
    endDate?: string
}

export interface Salary extends BaseEntity {
    month: number
    year: number
    amount: number
    bonus: number
    deduction: number
    status: "PAID" | "PENDING"
}

export interface LeaveRequest extends BaseEntity {
    startDate: string
    endDate: string
    type: "SICK" | "ANNUAL" | "MATERNITY"
    reason: string
    status: "PENDING" | "APPROVED" | "REJECTED"
}
