import { create } from 'zustand'
import type { LeaveRequest } from '@/types/leave.types'

interface LeaveRequestState {
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  setLeaveRequests: (leaveRequests: LeaveRequest[]) => void
  setLoading: (isLoading: boolean) => void
}

export const useLeaveRequestStore = create<LeaveRequestState>((set) => ({
  leaveRequests: [],
  isLoading: false,
  setLeaveRequests: (leaveRequests) => set({ leaveRequests }),
  setLoading: (isLoading) => set({ isLoading }),
}))
