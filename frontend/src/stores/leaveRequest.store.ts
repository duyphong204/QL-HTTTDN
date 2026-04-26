import { create } from 'zustand'
import { leaveRequestService } from '@/services/hr.service'
import { getErrorMessage } from '@/stores/store.helpers'
import { toast } from 'sonner'
import type { LeaveRequest, CreateLeaveRequestDto } from '@/types/leave.types'

interface LeaveRequestState {
  // Data
  myLeaveRequests: LeaveRequest[]
  allLeaveRequests: LeaveRequest[] // Dành cho quản lý
  isLoading: boolean

  // Actions cho Nhân viên
  fetchMyRequests: () => Promise<void>
  createRequest: (payload: CreateLeaveRequestDto) => Promise<void>
  deleteRequest: (id: string) => Promise<void>

  // Actions cho Quản lý
  fetchAllRequests: () => Promise<void>
  approveRequest: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>
}

export const useLeaveRequestStore = create<LeaveRequestState>((set, get) => ({
  myLeaveRequests: [],
  allLeaveRequests: [],
  isLoading: false,

  fetchMyRequests: async () => {
    set({ isLoading: true })
    try {
      const data = await leaveRequestService.getMyLeaveRequests()
      set({ myLeaveRequests: data })
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải đơn của bạn"))
    } finally {
      set({ isLoading: false })
    }
  },

  createRequest: async (payload: CreateLeaveRequestDto) => {
    set({ isLoading: true })
    try {
      const newReq = await leaveRequestService.createLeaveRequest(payload)
      set({ myLeaveRequests: [newReq, ...get().myLeaveRequests] })
      toast.success("Gửi đơn nghỉ phép thành công!")
    } catch (error) {
      toast.error(getErrorMessage(error))
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteRequest: async (id: string) => {
    try {
      await leaveRequestService.deleteLeaveRequest(id)
      set({
        myLeaveRequests: get().myLeaveRequests.filter((r) => r.id !== id),
      })
      toast.success("Đã xóa đơn nghỉ phép")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  },

  fetchAllRequests: async () => {
    set({ isLoading: true })
    try {
      const data = await leaveRequestService.getLeaveRequests()
      set({ allLeaveRequests: data })
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách đơn"))
    } finally {
      set({ isLoading: false })
    }
  },

  approveRequest: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await leaveRequestService.approveLeaveRequest(id, { status })
      set({
        allLeaveRequests: get().allLeaveRequests.map((r) => 
          r.id === id ? { ...r, status } : r
        ),
      })
      toast.success(status === 'APPROVED' ? 'Đã duyệt đơn' : 'Đã từ chối đơn')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  },
}))