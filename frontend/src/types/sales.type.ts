import type { BaseEntity } from "./common.type"
import type { Product } from "./warehouse.type"

// Cart
export interface Cart extends BaseEntity {
    userId: string
    items: CartItem[]
}

// CartItem
export interface CartItem extends BaseEntity {
    cartId: string
    productId: string
    product?: Product
    quantity: number
}

export interface AddToCartDto {
    productId: string
    quantity: number
}

export interface UpdateCartItemDto {
    quantity: number
}

// Order
export interface OrderDetail extends BaseEntity {
    orderId: string
    productId: string
    product?: Product
    quantity: number
    price: number
    costPrice: number
}

export interface Order extends BaseEntity {
    userId?: string  // Khách vãng lai (userId = null) hoặc user đăng nhập
    user?: {
        id: string
        email: string
    }
    fullName: string
    phone: string
    address: string
    totalAmount: number
    status: "PENDING" | "APPROVED" | "SHIPPING" | "COMPLETED" | "CANCELLED"
    paymentMethod: string
    paymentStatus: string
    details: OrderDetail[]
}

export interface CreateOrderDto {
    userId?: string
    fullName: string
    phone: string
    address: string
    paymentMethod: string
    items: {
        productId: string
        quantity: number
    }[]
}

export interface UpdateOrderStatusDto {
    status: "APPROVED" | "SHIPPING" | "COMPLETED" | "CANCELLED"
}

export interface CancelOrderDto {
    reason?: string
}
export interface SalesStats {
    month?: number
    year?: number
    period?: {
        year: number
        quarter?: number
    }
    totalOrders: number
    totalItemsSold: number
    totalRevenue: number
    totalProfit: number
}

export const StockOutStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const

export type StockOutStatus = (typeof StockOutStatus)[keyof typeof StockOutStatus]

export const StockOutType = {
    SALE: 'SALE',
    INTERNAL: 'INTERNAL',
    TRANSFER: 'TRANSFER',
} as const

export type StockOutType = (typeof StockOutType)[keyof typeof StockOutType]

export interface StockOutItem {
    productId: string
    quantity: number
    price: number
}

export interface StockOutDetail extends BaseEntity {
    stockOutId: string
    productId: string
    quantity: number
    price: number
    product?: Product
}

export interface StockOut extends BaseEntity {
    orderId?: string | null
    type: StockOutType
    createdById: string
    approvedById?: string | null
    totalAmount: number
    status: StockOutStatus
    details: StockOutDetail[]
}

export interface CreateStockOutDto {
    orderId?: string
    type: StockOutType
    items: StockOutItem[]
}

export interface UpdateStockOutDto {
    orderId?: string
    type?: StockOutType
    items?: StockOutItem[]
}

export interface StockOutQuery {
    status?: StockOutStatus
    type?: StockOutType
    fromDate?: string
    toDate?: string
}
