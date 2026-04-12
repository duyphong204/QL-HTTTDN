import { apiGet } from '@/api/base'
import type { AdminDashboardReport } from '@/types/admin.type'

export const adminService = {
  getDashboardReport: async (params?: { year?: number; month?: number }): Promise<AdminDashboardReport> => {
    return apiGet<AdminDashboardReport>('/admin/dashboard-report', params)
  },
}
