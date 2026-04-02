import { create } from 'zustand'
import { toast } from 'sonner'
import { orderApi } from '@/api/order.api'
import { productApi } from '@/api/warehouse.api'
import { employeeApi } from '@/api/hr.api'
import type { AdminDashboardReport } from '@/types/admin.type'

interface AdminStoreState {
  report: AdminDashboardReport | null
  isLoading: boolean
  error: string | null
  fetchDashboardReport: (params: { month?: number; year: number }) => Promise<void>
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Loi khong xac dinh'

export const useAdminStore = create<AdminStoreState>((set) => ({
  report: null,
  isLoading: false,
  error: null,

  fetchDashboardReport: async ({ month, year }) => {
    set({ isLoading: true, error: null })

    try {
      const [sales, warehouse, hr] = await Promise.all([
        orderApi.getSalesStats({ month, year }),
        productApi.getReport({ month, year }),
        employeeApi.getHrStatistics({ month, year }),
      ])

      set({
        report: {
          period: { month, year },
          generatedAt: new Date().toISOString(),
          sales: {
            totalOrders: sales.totalOrders,
            totalItemsSold: sales.totalItemsSold,
            totalRevenue: sales.totalRevenue,
            totalProfit: sales.totalProfit,
          },
          warehouse: {
            totalStockIns: warehouse.totalStockIns,
            totalImportValue: warehouse.totalImportValue,
            totalImportQuantity: warehouse.totalImportQuantity,
            totalProductTypes: warehouse.totalProductTypes,
            totalStockQuantity: warehouse.totalStockQuantity,
            lowStockProducts: warehouse.lowStockProducts,
          },
          hr: {
            totalEmployees: hr.totalEmployees,
            totalResigned: hr.totalResigned,
            headcount: hr.headcount,
            totalSalaryPaid: hr.totalSalaryPaid,
            totalBonus: hr.totalBonus,
          },
        },
      })
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      set({ error: message })
      toast.error(message)
    } finally {
      set({ isLoading: false })
    }
  },
}))
