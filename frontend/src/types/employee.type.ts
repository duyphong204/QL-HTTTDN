export interface Profile {
  id: string
  userId: string
  fullName: string
  phone: string | null
  address: string | null
  avatar: string | null
  dateOfBirth: string | null
}

export interface User {
  id: string
  email: string
  profile: Profile
}

export interface JobHistory {
  id: string
  employeeId: string
  department: string | null
  position: string | null
  baseSalary: number
  startDate: string
  endDate: string | null
}

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

export interface UpdateProfileDto {
  fullName?: string
  phone?: string
  address?: string
  dateOfBirth?: string
}