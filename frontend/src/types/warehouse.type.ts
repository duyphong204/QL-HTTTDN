import type { BaseEntity } from "./common.type"

export interface Category extends BaseEntity {
    name: string
}

export interface Supplier extends BaseEntity {
    name: string
    address?: string
    phone?: string
    email?: string
}

export interface Product extends BaseEntity {
    name: string
    description?: string
    price: number
    costPrice: number
    stockQuantity: number
    minStock: number
    category: Category
    supplier: Supplier
}

export interface StockIn extends BaseEntity {
    date: string
    totalAmount: number
}
