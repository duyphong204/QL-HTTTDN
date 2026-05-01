import type { BaseEntity } from "./common.types";
import type { Product } from "./warehouse.type";

export interface Cart extends BaseEntity {
  userId: string;
  items: CartItem[];
}

export interface CartItem extends BaseEntity {
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface SyncCartDto {
  items: AddToCartDto[];
}

export interface OrderDetail extends BaseEntity {
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  costPrice: number;
}

export interface Order extends BaseEntity {
  userId?: string; // Khách vãng lai (userId = null) hoặc user đăng nhập
  fullName: string;
  customerName?: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: "PENDING" | "APPROVED" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  paymentMethod: string;
  paymentStatus: string;
  details: OrderDetail[];
  items?: OrderItem[];
}
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}
export interface CreateOrderDto {
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod?: "COD" | "BANK_TRANSFER";
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateOrderResponse {
  order: Order;
  paymentTransactionId?: string;
  paymentUrl?: string;
  requiresPayment: boolean;
}

export interface VerifyPaymentReturnResponse {
  success: boolean;
  orderId: string;
  paymentStatus: "PAID" | "FAILED";
  resultCode?: number;
  transId?: string;
  message: string;
}

export interface UpdateOrderStatusDto {
  status: "APPROVED" | "SHIPPING" | "COMPLETED" | "CANCELLED";
}

export interface CancelOrderDto {
  reason?: string;
}

export interface SalesStats {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalItemsSold?: number;
  totalProductsSold: number;
}
