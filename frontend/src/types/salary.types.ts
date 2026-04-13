import type { BaseEntity } from "./common.types"
import type { Employee } from "./employee.types"

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
