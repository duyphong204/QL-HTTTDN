import { create } from "zustand"
import { leaveRequestApi } from "@/api/hr.api"
import { toast } from "sonner"

import type {
  LeaveRequest,
  CreateLeaveRequestDto
} from "@/types/hr.type"

interface LeaveRequestState {

  leaveRequests: LeaveRequest[]
  myLeaveRequests: LeaveRequest[]

  loading: boolean

  fetchLeaveRequests: () => Promise<void>
  fetchMyLeaveRequests: () => Promise<void>

  createLeaveRequest: (data: CreateLeaveRequestDto) => Promise<void>
  deleteLeaveRequest: (id: string) => Promise<void>
  approveLeaveRequest: (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => Promise<void>
}

export const useLeaveRequestStore = create<LeaveRequestState>((set, get) => ({

  leaveRequests: [],
  myLeaveRequests: [],

  loading: false,

  // HR lấy tất cả đơn
  fetchLeaveRequests: async () => {
    set({ loading: true })

    try {
      const data = await leaveRequestApi.getLeaveRequests()

      set({
        leaveRequests: data,
        loading: false
      })

    } catch (error : any) {
      const message = error?.response?.data?.message || "Không thể tải danh sách đơn nghỉ"
      toast.error(message)
      set({ loading: false })
    }
  },

  // Employee lấy đơn của mình
  fetchMyLeaveRequests: async () => {
    set({ loading: true })

    try {
      const data = await leaveRequestApi.getMyLeaveRequests()

      set({
        myLeaveRequests: data,
        loading: false
      })

    } catch (error : any) {
      const message = error?.response?.data?.message || "Không thể tải đơn nghỉ của bạn"
      toast.error(message)
      set({ loading: false })
    }
  },

  // Gửi đơn nghỉ
  createLeaveRequest: async (data) => {
    try {
      await leaveRequestApi.createLeaveRequest(data)

      toast.success("Gửi đơn nghỉ thành công")

      // reload danh sách của mình
      await get().fetchMyLeaveRequests()

    } catch (error : any) {
      const message = error?.response?.data?.message || "Gửi đơn nghỉ thất bại"
      toast.error(message)
      throw error
    }
  },
  deleteLeaveRequest: async (id) => {
    try {
      await leaveRequestApi.deleteLeaveRequest(id)
      set((state) => ({
        myLeaveRequests: state.myLeaveRequests.filter((item) => item.id !== id),
        leaveRequests: state.leaveRequests.filter((item) => item.id !== id),
      }))
      toast.success("Đã xóa đơn nghỉ")
    } catch (error : any) {
      const message = error?.response?.data?.message || "Xóa đơn nghỉ thất bại"
      toast.error(message)
      throw error
    }
  },

  // HR duyệt đơn
  approveLeaveRequest: async (id, status) => {
    try {
      await leaveRequestApi.approveLeaveRequest(id, { status })
      set((state) => ({
        leaveRequests: state.leaveRequests.map((item) =>
          item.id === id
            ? { ...item, status }
            : item
        )
      }))

      toast.success(
        status === "APPROVED"
          ? "Đã duyệt đơn nghỉ"
          : "Đã từ chối đơn nghỉ"
      )

    } catch (error : any) {
      const message = error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      toast.error(message)
      throw error
    }

  },

}))