import { create } from 'zustand'
import type { Order, SalesStats } from '@/types/order.types'

interface SalesState {
    orders: Order[]
    stats: SalesStats | null
    isLoading: boolean
    isLoadingStats: boolean
    setOrders: (orders: Order[]) => void
    setStats: (stats: SalesStats | null) => void
    setLoading: (isLoading: boolean) => void
    setLoadingStats: (isLoadingStats: boolean) => void
}

export const useSalesStore = create<SalesState>((set) => ({
    orders: [],
    stats: null,
    isLoading: false,
    isLoadingStats: false,

    setOrders: (orders) => set({ orders }),
    setStats: (stats) => set({ stats }),
    setLoading: (isLoading) => set({ isLoading }),
    setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),
}))
