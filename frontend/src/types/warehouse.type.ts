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
    categoryId: string
    supplierId: string
    category?: Category
    supplier?: Supplier
}

export interface CreateProductDto {
    name: string
    description?: string
    price: number
    costPrice: number
    stockQuantity: number
    minStock: number
    categoryId: string
    supplierId: string
}

export interface StockInDetail {
    productId: string
    quantity: number
    price: number
}

export interface CreateStockInDto {
    supplierId: string
    details: StockInDetail[]
}

export interface StockIn extends BaseEntity {
    date: string
    totalAmount: number
    supplierId: string
    supplier?: Supplier
    details?: StockInDetail[]
}
