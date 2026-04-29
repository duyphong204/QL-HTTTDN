import { create } from "zustand";
import { orderApi } from "@/api/order.api";
import { toast } from "sonner";
import type { Order, SalesStats } from "@/types/order.types";

interface SalesState {
  orders: Order[];
  stats: SalesStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  setOrders: (orders: Order[]) => void;
  setStats: (stats: SalesStats | null) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingStats: (isLoadingStats: boolean) => void;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<Order>;
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

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const data = await orderApi.getOrders();
      set({ orders: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi tải đơn hàng";
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const updated = await orderApi.updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
      }));
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi cập nhật trạng thái";
      toast.error(message);
      throw err;
    }
  },
}));
