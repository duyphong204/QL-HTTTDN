// frontend/src/store/sales.store.ts
import { create } from 'zustand'
import { toast } from 'sonner'
import { orderApi } from '@/api/order.api'
import { productApi } from '@/api/warehouse.api'
import type { Order, SalesStats } from '@/types/sales.type'
import type { Product } from '@/types/warehouse.type'

interface SalesState {
    orders: Order[]
    stats: SalesStats | null
    productOptions: Product[]
    isLoading: boolean
    isLoadingStats: boolean
    isLoadingProducts: boolean
    fetchOrders: () => Promise<void>
    fetchStats: (params: { month?: number; year?: number }) => Promise<void>
    fetchStatsByPeriod: (params: { year: number; quarter?: number }) => Promise<void>
    fetchProductOptions: () => Promise<void>
    createExportSlip: (data: { fullName: string; phone: string; address: string; paymentMethod?: string; items: { productId: string; quantity: number }[] }) => Promise<void>
    updateOrderStatus: (id: string, status: string) => Promise<void>
}

export const useSalesStore = create<SalesState>((set, get) => ({
    orders: [],
    stats: null,
    productOptions: [],
    isLoading: false,
    isLoadingStats: false,
    isLoadingProducts: false,

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

    fetchStatsByPeriod: async (params) => {
        set({ isLoadingStats: true })
        try {
            const data = await orderApi.getSalesStatsByPeriod(params)
            set({ stats: data, isLoadingStats: false })
        } catch {
            toast.error('Không thể tải thống kê')
            set({ isLoadingStats: false })
        }
    },

    fetchProductOptions: async () => {
        set({ isLoadingProducts: true })
        try {
            const response = await productApi.getProducts({
                page: 1,
                limit: 200,
                sortBy: 'name',
                sortOrder: 'asc',
            })
            set({ productOptions: response.data, isLoadingProducts: false })
        } catch {
            toast.error('Không thể tải danh sách sản phẩm')
            set({ isLoadingProducts: false })
        }
    },

    createExportSlip: async (data) => {
        try {
            await orderApi.createOrder({
                ...data,
                paymentMethod: data.paymentMethod ?? 'COD',
            })
            toast.success('Tạo phiếu xuất thành công')
            await get().fetchOrders()
        } catch {
            toast.error('Tạo phiếu xuất thất bại')
            throw new Error('failed')
        }
    },

    updateOrderStatus: async (id, status) => {
        try {
            await orderApi.updateOrderStatus(id, status)
            toast.success('Cập nhật trạng thái thành công')
            await get().fetchOrders()
        } catch {
            toast.error('Cập nhật thất bại')
        }
    },
}))
