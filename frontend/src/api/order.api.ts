import { axiosInstance } from "./axios"
import type { Order, CreateOrderDto, Cart, CartItem, AddToCartDto, SalesStats } from "@/types/sales.type"

export const orderApi = {
    getOrders: async () => {
        const res = await axiosInstance.get<Order[]>("/orders");
        return res.data;
    },

    getOrderById: async (id: string) => {
        const res = await axiosInstance.get<Order>(`/orders/${id}`);
        return res.data;
    },

    createOrder: async (data: CreateOrderDto) => {
        const res = await axiosInstance.post<Order>("/orders", data);
        return res.data;
    },

    updateOrderStatus: async (id: string, status: string) => {
        const res = await axiosInstance.patch<Order>(`/orders/${id}/status`, { status });
        return res.data;
    },

    cancelOrder: async (id: string, reason?: string) => {
        const res = await axiosInstance.patch<Order>(`/orders/${id}/cancel`, { reason });
        return res.data;
    },
    getSalesStats: async (params: { month?: number; year?: number }) => {
        const res = await axiosInstance.get<SalesStats>('/orders/stats', { params });
        return res.data;
    },

    getSalesStatsByPeriod: async (params: { year: number; quarter?: number }) => {
        const res = await axiosInstance.get<SalesStats>('/orders/period', { params });
        return res.data;
    },
};

export const cartApi = {
    getCart: async () => {
        const res = await axiosInstance.get<Cart>("/cart");
        return res.data;
    },

    addToCart: async (data: AddToCartDto) => {
        const res = await axiosInstance.post<CartItem>("/cart/items", data);
        return res.data;
    },

    updateCartItem: async (itemId: string, quantity: number) => {
        const res = await axiosInstance.patch<CartItem>(`/cart/items/${itemId}`, { quantity });
        return res.data;
    },

    removeCartItem: async (itemId: string) => {
        await axiosInstance.delete(`/cart/items/${itemId}`);
    },

    clearCart: async () => {
        await axiosInstance.post("/cart/clear");
    },
};