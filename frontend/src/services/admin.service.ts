import { apiGet } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import type { AdminDashboardReport } from '@/types/admin.type'

export const adminService = {
  getDashboardReport: async (params?: { year?: number; month?: number }): Promise<AdminDashboardReport> => {
    return apiGet<AdminDashboardReport>(endpoints.admin.dashboardReport, params)
  },
}
