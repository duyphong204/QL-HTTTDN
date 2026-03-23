// frontend/src/store/sales.store.ts
import { create } from 'zustand'
import { toast } from 'sonner'
import { orderApi } from '@/api/order.api'
import type { Order, SalesStats } from '@/types/sales.type'

interface SalesState {
    orders: Order[]
    stats: SalesStats | null
    isLoading: boolean
    isLoadingStats: boolean
    fetchOrders: () => Promise<void>
    fetchStats: (params: { month?: number; year?: number }) => Promise<void>
    createExportSlip: (data: { fullName: string; phone: string; address: string; items: { productId: string; quantity: number }[] }) => Promise<void>
    updateOrderStatus: (id: string, status: string) => Promise<void>
}

export const useSalesStore = create<SalesState>((set, get) => ({
    orders: [],
    stats: null,
    isLoading: false,
    isLoadingStats: false,

    fetchOrders: async () => {
        set({ isLoading: true })
        try {
            const data = await orderApi.getOrders()
            set({ orders: data, isLoading: false })
        } catch {
            toast.error('Không thể tải danh sách phiếu xuất')
            set({ isLoading: false })
        }
    },

    fetchStats: async (params) => {
        set({ isLoadingStats: true })
        try {
            const data = await orderApi.getSalesStats(params)
            set({ stats: data, isLoadingStats: false })
        } catch {
            toast.error('Không thể tải thống kê')
            set({ isLoadingStats: false })
        }
    },

    createExportSlip: async (data) => {
        try {
            await orderApi.createOrder(data)
            toast.success('Tạo phiếu xuất thành công')
            get().fetchOrders()
        } catch {
            toast.error('Tạo phiếu xuất thất bại')
            throw new Error('failed')
        }
    },

    updateOrderStatus: async (id, status) => {
        try {
            await orderApi.updateOrderStatus(id, status)
            toast.success('Cập nhật trạng thái thành công')
            get().fetchOrders()
        } catch {
            toast.error('Cập nhật thất bại')
        }
    },
}))
