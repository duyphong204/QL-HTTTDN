import type { BaseEntity } from "./common.type"

export interface Category extends BaseEntity {
    name: string
}

export interface Supplier extends BaseEntity {
    name: string
    address?: string
    phone?: string
    email?: string
    contactPerson?: string
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

export interface UpdateProductDto {
    name?: string
    description?: string
    price?: number
    costPrice?: number
    stockQuantity?: number
    minStock?: number
    categoryId?: string
    supplierId?: string
}

// Input khi tạo StockIn detail
export interface StockInDetailInput {
    productId: string
    quantity: number
    price: number
}

// Response khi lấy StockIn detail
export interface StockInDetail extends BaseEntity {
    stockInId: string
    productId: string
    product?: Product
    quantity: number
    price: number
}

export interface CreateStockInDto {
    supplierId: string
    date?: Date
    details: StockInDetailInput[]
}

export interface UpdateStockInDto {
    supplierId?: string
    date?: Date
    details?: StockInDetailInput[]
}

export interface StockIn extends BaseEntity {
    date: Date
    totalAmount: number
    supplierId: string
    createdById?: string
    supplier?: Supplier
    details?: StockInDetail[]
}
export interface CreateSupplierDto {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface UpdateSupplierDto {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
}