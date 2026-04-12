import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/base"
import type { Order, CreateOrderDto, Cart, CartItem, AddToCartDto, SalesStats } from "@/types/sales.type"

export const orderService = {
    getOrders: async (): Promise<Order[]> => {
        return apiGet<Order[]>("/orders");
    },

    getMyOrders: async (): Promise<Order[]> => {
        return apiGet<Order[]>('/orders/my');
    },

    getOrderById: async (id: string): Promise<Order> => {
        return apiGet<Order>(`/orders/${id}`);
    },

    createOrder: async (data: CreateOrderDto): Promise<Order> => {
        return apiPost<Order>("/orders", data);
    },

    updateOrderStatus: async (id: string, status: string): Promise<Order> => {
        return apiPatch<Order>(`/orders/${id}/status`, { status });
    },

    cancelOrder: async (id: string, reason?: string): Promise<Order> => {
        return apiPatch<Order>(`/orders/${id}/cancel`, { reason });
    },

    getSalesStats: async (params: { month?: number; year?: number }): Promise<SalesStats> => {
        return apiGet<SalesStats>('/orders/stats', params);
    },

    getSalesStatsByPeriod: async (params: { year: number; quarter?: number }): Promise<SalesStats> => {
        return apiGet<SalesStats>('/orders/period', params);
    },
};

export const cartService = {
    getCart: async (): Promise<Cart> => {
        return apiGet<Cart>("/cart");
    },

    addToCart: async (data: AddToCartDto): Promise<CartItem> => {
        return apiPost<CartItem>("/cart/items", data);
    },

    updateCartItem: async (itemId: string, quantity: number): Promise<CartItem> => {
        return apiPatch<CartItem>(`/cart/items/${itemId}`, { quantity });
    },

    removeCartItem: async (itemId: string): Promise<void> => {
        await apiDelete(`/cart/items/${itemId}`);
    },

    clearCart: async (): Promise<void> => {
        await apiPost("/cart/clear");
    },
};
