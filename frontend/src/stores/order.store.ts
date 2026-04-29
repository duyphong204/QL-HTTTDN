import { create } from "zustand";
import { orderApi } from "@/api/order.api";
import { toast } from "sonner";
import type {
  CreateOrderDto,
  CreateOrderResponse,
  VerifyPaymentReturnResponse,
} from "@/types/sales.type";

export interface OrderHistoryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderHistoryOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: OrderHistoryItem[];
  fullName?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface OrderState {
  orders: OrderHistoryOrder[];
  selectedOrder: OrderHistoryOrder | null;
  loading: boolean;
  fetchMyOrders: () => Promise<void>;
  createOrder: (data: CreateOrderDto) => Promise<CreateOrderResponse>;
  retryOrderPayment: (orderId: string) => Promise<CreateOrderResponse>;
  verifyMomoReturn: (
    params: URLSearchParams,
  ) => Promise<VerifyPaymentReturnResponse>;
  selectOrder: (order: OrderHistoryOrder) => void;
  clearSelected: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  loading: false,

  fetchMyOrders: async () => {
    set({ loading: true });
    try {
      const orders = await orderApi.getMyOrders();
      set({ orders });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi tải đơn hàng";
      toast.error(message);
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (data) => {
    try {
      return await orderApi.createOrder(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi đặt hàng";
      throw new Error(message);
    }
  },

  retryOrderPayment: async (orderId) => {
    try {
      return await orderApi.retryOrderPayment(orderId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi tạo lại link thanh toán";
      throw new Error(message);
    }
  },

  verifyMomoReturn: async (params) => {
    return orderApi.verifyMomoReturn(params);
  },

  selectOrder: (order) => set({ selectedOrder: order }),
  clearSelected: () => set({ selectedOrder: null }),
}));
