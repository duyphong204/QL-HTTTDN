import { create } from "zustand"
import { employeeService, salaryService, leaveRequestService } from "@/services/hr.service"
import { toast } from "sonner"
import { getErrorMessage } from "@/stores/store.helpers"

import type {
  LeaveRequest,
  CreateLeaveRequestDto,
} from "@/types/leave.types"
import type { Salary } from "@/types/salary.types"
import type { EmployeeProfile, UpdateMyProfileDto } from "@/types/employee.types"

interface EmployeeState {
  myProfile: EmployeeProfile | null
  mySalaries: Salary[]
  myLeaveRequests: LeaveRequest[]

  isLoadingProfile: boolean
  isLoadingSalary: boolean
  isLoadingLeave: boolean

  // Profile
  fetchMyProfile: () => Promise<void>
  updateMyProfile: (data: UpdateMyProfileDto) => Promise<void>

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
      const data = await employeeService.getMyProfile()
      set({ myProfile: data as EmployeeProfile })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Không thể tải thông tin hồ sơ!")
      toast.error(msg)
    } finally {
      set({ isLoadingProfile: false })
    }
  },

  updateMyProfile: async (data: UpdateMyProfileDto) => {
    set({ isLoadingProfile: true })

    try {
      await employeeService.updateMyProfile(data)
      toast.success("Cập nhật hồ sơ thành công!")
      await get().fetchMyProfile()
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Lỗi khi cập nhật hồ sơ!")
      toast.error(msg)
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
      const data = await salaryService.getMySalaries(params)
      set({ mySalaries: data })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Không thể tải bảng lương!")
      toast.error(msg)
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
      const data = await leaveRequestService.getMyLeaveRequests()
      set({ myLeaveRequests: data })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Không thể tải đơn nghỉ phép!")
      toast.error(msg)
    } finally {
      set({ isLoadingLeave: false })
    }
  },

  createLeaveRequest: async (data) => {
    try {
      await leaveRequestService.createLeaveRequest(data)
      toast.success("Gửi đơn nghỉ phép thành công!")
      await get().fetchMyLeaveRequests()
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Không thể gửi đơn nghỉ phép!")
      toast.error(msg)
      throw error
    }
  },

  deleteLeaveRequest: async (id) => {
    try {
      await leaveRequestService.deleteLeaveRequest(id)

      set((state) => ({
        myLeaveRequests: state.myLeaveRequests.filter((l) => l.id !== id),
      }))

      toast.success("Đã xóa đơn nghỉ phép")
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Không thể xóa đơn nghỉ phép")
      toast.error(msg)
    }
  },
}))
