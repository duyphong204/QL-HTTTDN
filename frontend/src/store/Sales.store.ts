import { create } from "zustand";
import { orderApi } from "@/api/order.api";
import type { Order, CartItem, CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto, AddToCartDto, UpdateCartItemDto } from "@/types";
import { toast } from "sonner";

interface SalesState {
    // Orders
    orders: Order[];
    ordersLoading: boolean;
    ordersError: string | null;

    // Cart (client-side only, stored in localStorage)
    cart: CartItem[];
    cartLoading: boolean;

    // Actions
    actions: {
        // Order actions
        fetchOrders: () => Promise<void>;
        createOrder: (data: CreateOrderDto) => Promise<Order>;
        updateOrderStatus: (id: string, data: UpdateOrderStatusDto) => Promise<void>;
        cancelOrder: (id: string, data: CancelOrderDto) => Promise<void>;
        getOrderById: (id: string) => Promise<Order | null>;

        // Cart actions (client-side)
        loadCart: () => void;
        addToCart: (data: AddToCartDto) => void;
        updateCartItem: (productId: string, data: UpdateCartItemDto) => void;
        removeFromCart: (productId: string) => void;
        clearCart: () => void;
        getCartTotal: () => number;
        getCartItemCount: () => number;
    };
}

export const useSalesStore = create<SalesState>((set, get) => ({
    // Orders state
    orders: [],
    ordersLoading: false,
    ordersError: null,

    // Cart state
    cart: [],
    cartLoading: false,

    actions: {
        // Order actions
        fetchOrders: async () => {
            set({ ordersLoading: true, ordersError: null });
            try {
                const response = await orderApi.getOrders();
                const orders = Array.isArray(response) ? response : response.data || [];
                set({ orders, ordersLoading: false });
            } catch (error: any) {
                console.error("Error fetching orders:", error);
                set({
                    orders: [],
                    ordersLoading: false,
                    ordersError: error.message || "Failed to fetch orders",
                });
                toast.error("Lấy danh sách đơn hàng thất bại: " + (error.message || "Unknown error"));
            }
        },

        createOrder: async (data) => {
            set({ ordersLoading: true, ordersError: null });
            try {
                const newOrder = await orderApi.createOrder(data);
                toast.success("Đặt hàng thành công");
                get().actions.clearCart(); // Clear cart after successful order
                get().actions.fetchOrders(); // Refresh orders list
                return newOrder;
            } catch (error: any) {
                set({ ordersError: error.message, ordersLoading: false });
                toast.error("Đặt hàng thất bại: " + error.message);
                throw error;
            }
        },

        updateOrderStatus: async (id, data) => {
            set({ ordersLoading: true, ordersError: null });
            try {
                await orderApi.updateOrderStatus(id, data.status);
                toast.success("Cập nhật trạng thái đơn hàng thành công");
                get().actions.fetchOrders();
            } catch (error: any) {
                set({ ordersError: error.message, ordersLoading: false });
                toast.error("Cập nhật trạng thái đơn hàng thất bại: " + error.message);
                throw error;
            }
        },

        cancelOrder: async (id, data) => {
            set({ ordersLoading: true, ordersError: null });
            try {
                await orderApi.cancelOrder(id, data.reason);
                toast.success("Hủy đơn hàng thành công");
                get().actions.fetchOrders();
            } catch (error: any) {
                set({ ordersError: error.message, ordersLoading: false });
                toast.error("Hủy đơn hàng thất bại: " + error.message);
                throw error;
            }
        },

        getOrderById: async (id) => {
            try {
                const order = await orderApi.getOrderById(id);
                return order;
            } catch (error: any) {
                console.error("Error fetching order:", error);
                toast.error("Lấy thông tin đơn hàng thất bại: " + error.message);
                return null;
            }
        },

        // Cart actions (client-side with localStorage)
        loadCart: () => {
            try {
                const cartData = localStorage.getItem('cart');
                if (cartData) {
                    const cart = JSON.parse(cartData);
                    set({ cart });
                }
            } catch (error) {
                console.error("Error loading cart:", error);
                set({ cart: [] });
            }
        },

        addToCart: (data) => {
            const { cart } = get();
            const existingItem = cart.find(item => item.productId === data.productId);

            let newCart;

            if (existingItem) {
                newCart = cart.map(item =>
                    item.productId === data.productId
                        ? { ...item, quantity: item.quantity + data.quantity }
                        : item
                );
            } else {
                // Note: This assumes product data is passed or fetched elsewhere
                // In practice, you might need to fetch product details here
                newCart = [...cart, {
                    id: Date.now().toString(), // Temporary ID for cart item
                    cartId: 'temp', // Will be set when creating order
                    productId: data.productId,
                    product: data.product,
                    quantity: data.quantity,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    // product: productData // Should be populated
                }];
            }

            localStorage.setItem('cart', JSON.stringify(newCart));
            set({ cart: newCart });
            toast.success("Đã thêm vào giỏ hàng");
        },

        updateCartItem: (productId, data) => {
            const { cart } = get();
            const newCart = cart.map(item =>
                item.productId === productId
                    ? { ...item, quantity: data.quantity }
                    : item
            ).filter(item => item.quantity > 0); // Remove items with 0 quantity

            localStorage.setItem('cart', JSON.stringify(newCart));
            set({ cart: newCart });
        },

        removeFromCart: (productId) => {
            const { cart } = get();
            const newCart = cart.filter(item => item.productId !== productId);

            localStorage.setItem('cart', JSON.stringify(newCart));
            set({ cart: newCart });
            toast.success("Đã xóa khỏi giỏ hàng");
        },

        clearCart: () => {
            localStorage.removeItem('cart');
            set({ cart: [] });
        },

        getCartTotal: () => {
            const { cart } = get();
            return cart.reduce((total, item) => {
                return total + (item.product?.price || 0) * item.quantity;
            }, 0);
        },

        getCartItemCount: () => {
            const { cart } = get();
            return cart.reduce((count, item) => count + item.quantity, 0);
        },
    },
}));