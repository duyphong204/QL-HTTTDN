import type { BaseEntity, PaginatedResponse } from "./common.type"
import type { Category } from "./category.type";
export interface Supplier extends BaseEntity {
  name: string
  address?: string
  phone?: string
  email?: string
  contactPerson?: string
}

/* =======================
   PRODUCT DTO
======================= */

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

/* =======================
   PRODUCT ENTITY
======================= */

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

/* =======================
   PRODUCT QUERY
======================= */

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

/* =======================
   STOCK IN DETAIL
======================= */

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

/* =======================
   STOCK IN DTO
======================= */

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

/* =======================
   STOCK IN STATUS
======================= */

export const StockInStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export type StockInStatus =
  (typeof StockInStatus)[keyof typeof StockInStatus]

/* =======================
   STOCK IN ENTITY
======================= */

export interface StockIn extends BaseEntity {
  date: string | Date
  totalAmount: number

  supplierId: string
  createdById?: string
  approvedById?: string

  status: StockInStatus

  supplier?: Supplier
  details?: StockInDetail[]

  creatorName?: string
  approverName?: string
}

/* =======================
   SUPPLIER DTO
======================= */

export interface CreateSupplierDto {
  name: string
  phone?: string
  email?: string
  address?: string
}

export interface UpdateSupplierDto {
  name?: string
  phone?: string
  email?: string
  address?: string
}

/* =======================
   REPORT
======================= */

export interface WarehouseReport {
  period: {
    month?: number
    year: number
  }

  totalStockIns: number
  totalImportValue: number
  totalImportQuantity: number

  totalProductTypes: number
  totalStockQuantity: number

  lowStockProducts: {
    id: string
    name: string
    stockQuantity: number
    minStock: number
  }[]
}