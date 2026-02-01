import type { BaseEntity } from "./common.type"
import type { Product } from "./warehouse.type"

export interface CartItem {
    product: Product
    quantity: number
}

export interface OrderDetail {
    product: Product
    quantity: number
    price: number
    costPrice: number
}

export interface Order extends BaseEntity {
    fullName: string
    phone: string
    address: string
    totalAmount: number
    status: "PENDING" | "APPROVED" | "SHIPPING" | "COMPLETED" | "CANCELLED"
    paymentMethod: string
    paymentStatus: string
    details: OrderDetail[]
}
