import type { BaseEntity, PaginatedResponse } from "./common.types"
import type { Supplier } from "./supplier.types"

export interface Category extends BaseEntity {
    name: string
    _count?: {
        products: number
    }
    products?: Product[]
}

export interface CreateCategoryDto {
    name: string
}

export interface UpdateCategoryDto {
    name: string
}

export interface CategoryResponse {
    data: Category[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface CreateProductDto {
    name: string
    description?: string
    price: number
    costPrice: number
    stockQuantity: number
    categoryId: string
    supplierId: string
    image?: File
}

export interface UpdateProductDto {
    name?: string
    description?: string
    price?: number
    costPrice?: number
    stockQuantity?: number
    categoryId?: string
    supplierId?: string
    image?: File
}

export interface Product extends BaseEntity {
    name: string
    description?: string
    price: number
    costPrice: number
    stockQuantity: number
    minStock: number
    imageUrl?: string
    isLowStock?: boolean
    categoryId: string
    supplierId: string
    category?: Category
    supplier?: Supplier
}

export interface ProductQuery {
    search?: string
    categoryId?: string
    supplierId?: string
    page?: number
    limit?: number
    sortBy?: "name" | "price" | "costPrice" | "stockQuantity"
    sortOrder?: "asc" | "desc"
}

export type ProductResponse = PaginatedResponse<Product>
