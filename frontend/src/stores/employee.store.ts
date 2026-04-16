import { create } from "zustand"
import type {
  LeaveRequest,
} from "@/types/leave.types"
import type { Salary } from "@/types/salary.types"
import type { EmployeeProfile } from "@/types/employee.types"

interface EmployeeState {
  myProfile: EmployeeProfile | null
  mySalaries: Salary[]
  myLeaveRequests: LeaveRequest[]

  isLoadingProfile: boolean
  isLoadingSalary: boolean
  isLoadingLeave: boolean

  setMyProfile: (profile: EmployeeProfile | null) => void
  setMySalaries: (salaries: Salary[]) => void
  setMyLeaveRequests: (leaveRequests: LeaveRequest[]) => void
  setLoadingProfile: (loading: boolean) => void
  setLoadingSalary: (loading: boolean) => void
  setLoadingLeave: (loading: boolean) => void
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  myProfile: null,
  mySalaries: [],
  myLeaveRequests: [],

  isLoadingProfile: false,
  isLoadingSalary: false,
  isLoadingLeave: false,
  setMyProfile: (myProfile) => set({ myProfile }),
  setMySalaries: (mySalaries) => set({ mySalaries }),
  setMyLeaveRequests: (myLeaveRequests) => set({ myLeaveRequests }),
  setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),
  setLoadingSalary: (isLoadingSalary) => set({ isLoadingSalary }),
  setLoadingLeave: (isLoadingLeave) => set({ isLoadingLeave }),
}))
