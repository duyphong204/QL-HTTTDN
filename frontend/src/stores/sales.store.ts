import { create } from 'zustand'
import { toast } from 'sonner'
import { orderService } from '@/services/sales.service'
import { productService } from '@/services/warehouse.service'
import type { Order, SalesStats } from '@/types/order.types'
import type { Product } from '@/types/product.types'
import { getErrorMessage } from '@/stores/store.helpers'

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
            const data = await orderService.getOrders()
            set({ orders: data, isLoading: false })
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Không thể tải danh sách phiếu xuất')
            toast.error(msg)
            set({ isLoading: false })
        }
    },


    fetchStats: async (params) => {
        set({ isLoadingStats: true })
        try {
            const data = await orderService.getSalesStats(params)
            set({ stats: data, isLoadingStats: false })
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Không thể tải thống kê')
            toast.error(msg)
            set({ isLoadingStats: false })
        }
    },

    fetchStatsByPeriod: async (params) => {
        set({ isLoadingStats: true })
        try {
            const data = await orderService.getSalesStatsByPeriod(params)
            set({ stats: data, isLoadingStats: false })
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Không thể tải thống kê')
            toast.error(msg)
            set({ isLoadingStats: false })
        }
    },

    fetchProductOptions: async () => {
        set({ isLoadingProducts: true })
        try {
            const response = await productService.getProducts({
                page: 1,
                limit: 200,
                sortBy: 'name',
                sortOrder: 'asc',
            })
            set({ productOptions: response.data, isLoadingProducts: false })
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Không thể tải danh sách sản phẩm')
            toast.error(msg)
            set({ isLoadingProducts: false })
        }
    },


    updateOrderStatus: async (id, status) => {
        try {
            await orderService.updateOrderStatus(id, status)
            toast.success('Cập nhật trạng thái thành công')
            await get().fetchOrders()
        } catch (error: unknown) {
            const msg = getErrorMessage(error, 'Cập nhật thất bại')
            toast.error(msg)
        }
    },

    // Order-related actions only
}))
