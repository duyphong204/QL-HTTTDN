import type { BaseEntity } from "./common.types"
import type { User } from "./user.types"

export interface LeaveRequest extends BaseEntity {
    employeeId?: string
    employeeName?: string
    startDate: string
    endDate: string
    type: "SICK" | "ANNUAL"| "RESIGNATION"
    reason: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    approvedById?: string
    approvedByUser?: User
}

export interface CreateLeaveRequestDto {
    startDate: string
    endDate: string
    type: "SICK" | "ANNUAL" | "RESIGNATION"
    reason: string
}

export interface ApproveLeaveRequestDto {
    status: "APPROVED" | "REJECTED"
}

export interface QueryLeaveRequestDto {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    type?: 'SICK' | 'ANNUAL'| 'RESIGNATION'
    employeeId?: string
    year?: string
}
