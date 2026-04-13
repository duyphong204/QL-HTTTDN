import { create } from 'zustand'
import { toast } from 'sonner'
import { adminService } from '@/services/admin.service'
import type { AdminDashboardReport } from '@/types/report.types'
import { getErrorMessage } from '@/stores/store.helpers'

interface AdminState {
  report: AdminDashboardReport | null
  isLoading: boolean
  error: string | null

  fetchDashboardReport: (params?: { year?: number; month?: number }) => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  report: null,
  isLoading: false,
  error: null,

  fetchDashboardReport: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const report = await adminService.getDashboardReport(params)
      set({ report, isLoading: false })
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Không thể tải báo cáo tổng hợp')
      set({ error: message, isLoading: false })
      toast.error(message)
    }
  },
}))
