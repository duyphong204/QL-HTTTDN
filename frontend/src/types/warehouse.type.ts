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

export interface ProductResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}