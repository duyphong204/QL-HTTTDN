import { apiGet, apiPost, apiPatch, apiDelete } from "@/api/client";
import type {
  Order,
  CreateOrderDto,
  CreateOrderResponse,
  VerifyPaymentReturnResponse,
  SalesStats,
  Cart,
  AddToCartDto,
  SyncCartDto,
} from "@/types/sales.type";

export const orderApi = {
  getOrders: async () => {
    return apiGet<Order[]>("/orders");
  },

  getOrderById: async (id: string) => {
    return apiGet<Order>(`/orders/${id}`);
  },

  getMyOrders: async () => {
    return apiGet<Order[]>("/orders/me");
  },

  createOrder: async (data: CreateOrderDto) => {
    return apiPost<CreateOrderResponse>("/orders", data);
  },

  retryOrderPayment: async (orderId: string) => {
    return apiPost<CreateOrderResponse>(`/orders/${orderId}/retry-payment`);
  },

  verifyMomoReturn: async (params: URLSearchParams) => {
    return apiGet<VerifyPaymentReturnResponse>(
      "/payments/momo/verify-return",
      Object.fromEntries(params.entries()),
    );
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiPatch<Order>(`/orders/${id}/status`, {
      status,
    });
  },

  cancelOrder: async (id: string, reason?: string) => {
    return apiPatch<Order>(`/orders/${id}/cancel`, {
      reason,
    });
  },

  getSalesStats: async (params?: { month?: number; year?: number }) => {
    return apiGet<SalesStats>("/orders/stats", params);
  },

  getSalesStatsByPeriod: async (params: { year: number; quarter?: number }) => {
    return apiGet<SalesStats>("/orders/stats/period", params);
  },
};

export const cartApi = {
  getCart: async () => {
    return apiGet<Cart>("/cart");
  },

  addToCart: async (data: AddToCartDto) => {
    return apiPost<Cart>("/cart/items", data);
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    return apiPatch<Cart>(`/cart/items/${itemId}`, {
      quantity,
    });
  },

  removeCartItem: async (itemId: string) => {
    return apiDelete<Cart>(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    return apiPost<Cart>("/cart/clear");
  },

  syncCart: async (data: SyncCartDto) => {
    return apiPost<Cart>("/cart/sync", data);
  },
};
