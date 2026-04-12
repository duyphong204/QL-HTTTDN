import type { User } from "./user.type"
import type { JobHistory } from "./hr.type"

export interface EmployeeProfile {
  id: string
  userId: string
  code: string
  department?: string
  position?: string
  baseSalary: number
  joinDate: Date
  resignDate?: Date | undefined
  user: User
  jobHistories?: JobHistory[]
}

export interface UpdateMyProfileDto {
  fullName?: string
  phone?: string
  address?: string
  avatar?: string
  dateOfBirth?: string
}
