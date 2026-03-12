import { create } from "zustand"
import { employeeApi, salaryApi, leaveRequestApi } from "@/api/hr.api"
import { toast } from "sonner"

import type {
  Salary,
  LeaveRequest,
  CreateLeaveRequestDto,
} from "@/types/hr.type"
import type { EmployeeProfile,UpdateProfileDto } from "@/types/employee.type"

interface EmployeeState {
  myProfile:EmployeeProfile | null
  mySalaries: Salary[]
  myLeaveRequests: LeaveRequest[]

  isLoadingProfile: boolean
  isLoadingSalary: boolean
  isLoadingLeave: boolean

  // Profile
  fetchMyProfile: () => Promise<void>
  updateMyProfile: (data: UpdateProfileDto) => Promise<void>

  // Salary
  fetchMySalaries: (params?: { month?: number; year?: number }) => Promise<void>

  // Leave Requests
  fetchMyLeaveRequests: () => Promise<void>
  createLeaveRequest: (data: CreateLeaveRequestDto) => Promise<void>
  deleteLeaveRequest: (id: string) => Promise<void>
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  myProfile: null,
  mySalaries: [],
  myLeaveRequests: [],

  isLoadingProfile: false,
  isLoadingSalary: false,
  isLoadingLeave: false,

  // =================
  // PROFILE
  // =================

  fetchMyProfile: async () => {
    set({ isLoadingProfile: true })

    try {
      const data = await employeeApi.getMyProfile()
      set({ myProfile: data })
    } catch {
      toast.error("Không thể tải thông tin hồ sơ!")
    } finally {
      set({ isLoadingProfile: false })
    }
  },

  updateMyProfile: async (data :UpdateProfileDto) => {
    set({ isLoadingProfile: true })

    try {
      await employeeApi.updateMyProfile(data)

      toast.success("Cập nhật hồ sơ thành công!")

      await get().fetchMyProfile()
    } catch (error) {
      toast.error("Lỗi khi cập nhật hồ sơ!")
      throw error
    } finally {
      set({ isLoadingProfile: false })
    }
  },

  // =================
  // SALARY
  // =================

  fetchMySalaries: async (params) => {
    set({ isLoadingSalary: true })

    try {
      const data = await salaryApi.getMySalaries(params)
      set({ mySalaries: data })
    } catch {
      toast.error("Không thể tải bảng lương!")
    } finally {
      set({ isLoadingSalary: false })
    }
  },

  // =================
  // LEAVE REQUEST
  // =================

  fetchMyLeaveRequests: async () => {
    set({ isLoadingLeave: true })

    try {
      const data = await leaveRequestApi.getMyLeaveRequests()
      set({ myLeaveRequests: data })
    } catch {
      toast.error("Không thể tải đơn nghỉ phép!")
    } finally {
      set({ isLoadingLeave: false })
    }
  },

  createLeaveRequest: async (data) => {
    try {
      await leaveRequestApi.createLeaveRequest(data)

      toast.success("Gửi đơn nghỉ phép thành công!")

      await get().fetchMyLeaveRequests()
    } catch {
      toast.error("Không thể gửi đơn nghỉ phép!")
      throw error
    }
  },

  deleteLeaveRequest: async (id) => {
    try {
      await leaveRequestApi.deleteLeaveRequest(id)

      set((state) => ({
        myLeaveRequests: state.myLeaveRequests.filter((l) => l.id !== id),
      }))

      toast.success("Đã xóa đơn nghỉ phép")
    } catch {
      toast.error("Không thể xóa đơn nghỉ phép")
    }
  },
}))