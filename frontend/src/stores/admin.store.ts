import { create } from 'zustand'
import type { AdminDashboardReport } from '@/types/report.types'

interface AdminState {
  report: AdminDashboardReport | null
  isLoading: boolean
  error: string | null

  setReport: (report: AdminDashboardReport | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useAdminStore = create<AdminState>((set) => ({
  report: null,
  isLoading: false,
  error: null,

  setReport: (report) => set({ report }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
