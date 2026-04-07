import type { User } from "./user.type"
import type { JobHistory } from "./hr.type"

export interface EmployeeProfile {
  id: string
  userId: string
  code: string
  department: string
  position: string
  baseSalary: number
  joinDate: string
  resignDate: string | null
  user: User
  jobHistories: JobHistory[]
}

// DTO cho nhân viên tự cập nhật thông tin cá nhân (khác với UpdateProfileDto của admin/hr)
export interface UpdateMyProfileDto {
  fullName?: string
  phone?: string
  address?: string
  avatar?: string
  dateOfBirth?: string
}