import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type {
  Order,
  CreateOrderDto,
  Cart,
  CartItem,
  AddToCartDto,
  SalesStats,
} from "@/types/order.types";
import type {
  StockOut,
  CreateStockOutDto,
  StockOutQuery,
  UpdateStockOutDto,
} from "@/types/stockOut.types";

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    return apiGet<Order[]>(endpoints.orders.root);
  },

  getMyOrders: async (): Promise<Order[]> => {
    return apiGet<Order[]>(endpoints.orders.my);
  },

  getOrderById: async (id: string): Promise<Order> => {
    return apiGet<Order>(endpoints.orders.byId(id));
  },

  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    return apiPost<Order>(endpoints.orders.root, data);
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    return apiPatch<Order>(endpoints.orders.status(id), { status });
  },

  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    return apiPatch<Order>(endpoints.orders.cancel(id), { reason });
  },

  getSalesStats: async (params: {
    month?: number;
    year?: number;
  }): Promise<SalesStats> => {
    return apiGet<SalesStats>(endpoints.orders.stats, params);
  },

  getSalesStatsByPeriod: async (params: {
    year: number;
    quarter?: number;
  }): Promise<SalesStats> => {
    return apiGet<SalesStats>(endpoints.orders.period, params);
  },
};

export const cartService = {
  getCart: async (): Promise<Cart> => {
    return apiGet<Cart>(endpoints.cart.root);
  },

  addToCart: async (data: AddToCartDto): Promise<CartItem> => {
    return apiPost<CartItem>(endpoints.cart.items, data);
  },

  updateCartItem: async (
    itemId: string,
    quantity: number,
  ): Promise<CartItem> => {
    return apiPatch<CartItem>(endpoints.cart.item(itemId), { quantity });
  },

  removeCartItem: async (itemId: string): Promise<void> => {
    await apiDelete(endpoints.cart.item(itemId));
  },

  clearCart: async (): Promise<void> => {
    await apiPost(endpoints.cart.clear);
  },
};

export const stockOutService = {
  getStockOuts: async (params?: StockOutQuery): Promise<StockOut[]> => {
    return apiGet<StockOut[]>(endpoints.stockOuts.root, params);
  },

  getStockOutById: async (id: string): Promise<StockOut> => {
    return apiGet<StockOut>(endpoints.stockOuts.byId(id));
  },

  createStockOut: async (data: CreateStockOutDto): Promise<StockOut> => {
    return apiPost<StockOut>(endpoints.stockOuts.root, data);
  },

  updateStockOut: async (
    id: string,
    data: UpdateStockOutDto,
  ): Promise<StockOut> => {
    return apiPatch<StockOut>(endpoints.stockOuts.byId(id), data);
  },

  deleteStockOut: async (id: string): Promise<void> => {
    await apiDelete(endpoints.stockOuts.byId(id));
  },
};
