import { apiDelete, apiGet, apiPatch, apiPost } from "./base";
import type {
  Order,
  CreateOrderDto,
  CreateOrderResponse,
  VerifyPaymentReturnResponse,
  SalesStats,
  Cart,
  CartItem,
  AddToCartDto,
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

  verifyVnpayReturn: async (params: URLSearchParams) => {
    return apiGet<VerifyPaymentReturnResponse>(
      "/payments/vnpay/verify-return",
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
    return apiPost<CartItem>("/cart/items", data);
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    return apiPatch<CartItem>(`/cart/items/${itemId}`, {
      quantity,
    });
  },

  removeCartItem: async (itemId: string) => {
    await apiDelete(`/cart/items/${itemId}`);
  },

  clearCart: async () => {
    await apiPost("/cart/clear");
  },
};
