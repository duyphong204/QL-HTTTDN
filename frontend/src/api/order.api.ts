import { apiDelete, apiGet, apiPatch, apiPost } from "./base"
import type { Order, CreateOrderDto, Cart, CartItem, AddToCartDto, SalesStats } from "@/types/sales.type"

export const orderApi = {
    getOrders: async () => {
        return apiGet<Order[]>("/orders");
    },

    getMyOrders: async () => {
        return apiGet<Order[]>('/orders/my');
    },

    getOrderById: async (id: string) => {
        return apiGet<Order>(`/orders/${id}`);
    },

    createOrder: async (data: CreateOrderDto) => {
        return apiPost<Order>("/orders", data);
    },

    updateOrderStatus: async (id: string, status: string) => {
        return apiPatch<Order>(`/orders/${id}/status`, { status });
    },

    cancelOrder: async (id: string, reason?: string) => {
        return apiPatch<Order>(`/orders/${id}/cancel`, { reason });
    },
    getSalesStats: async (params: { month?: number; year?: number }) => {
        return apiGet<SalesStats>('/orders/stats', params);
    },

    getSalesStatsByPeriod: async (params: { year: number; quarter?: number }) => {
        return apiGet<SalesStats>('/orders/period', params);
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
        return apiPatch<CartItem>(`/cart/items/${itemId}`, { quantity });
    },

    removeCartItem: async (itemId: string) => {
        await apiDelete(`/cart/items/${itemId}`);
    },

    clearCart: async () => {
        await apiPost("/cart/clear");
    },
};