import { create } from 'zustand'
import { toast } from 'sonner'
import { categoryApi, productApi, supplierApi } from '@/api/warehouse.api'

import type {
  Product,
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
  Supplier,
} from '@/types/warehouse.type'
import type { Category } from '@/types/category.type'
import type { BaseFilters, SortOrder } from '@/types/common.type'
import { getErrorMessage, loadingState, mergeFiltersWithPageReset } from '@/store/store.helpers'

type ProductFilters = BaseFilters & {
  categoryId?: string
  supplierId?: string
  sortBy: 'name' | 'price' | 'costPrice' | 'stockQuantity'
  sortOrder: SortOrder
}

interface ProductState {
  products: Product[]
  meta?: ProductResponse['meta']
  filters: ProductFilters
  report: {
    period: { month?: number; year: number }
    totalStockIns: number
    totalImportValue: number
    totalImportQuantity: number
    totalProductTypes: number
    totalStockQuantity: number
    lowStockProducts: { id: string; name: string; stockQuantity: number; minStock: number }[]
  } | null
  isLoading: boolean
  isLoadingReport: boolean
  categories: Category[]
  suppliers: Supplier[]
  fetchProducts: () => Promise<void>
  fetchReport: (params?: { month?: number; year?: number }) => Promise<void>
  setFilters: (filters: Partial<ProductFilters>) => void
  createProduct: (data: CreateProductDto) => Promise<void>
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchSuppliers: () => Promise<void>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  meta: undefined,
  report: null,
  categories: [],
  suppliers: [],
  filters: {
    page: 1,
    limit: 10,
    search: '',
    categoryId: '',
    supplierId: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },

  isLoading: false,
  isLoadingReport: false,

  fetchProducts: async () => {
    try {
      set(loadingState('isLoading', true))
      const { filters } = get()
      const res = await productApi.getProducts(filters)

      set({
        products: res.data,
        meta: res.meta,
        ...loadingState('isLoading', false),
      })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Không thể tải danh sách sản phẩm')
      toast.error(msg)
      set(loadingState('isLoading', false))
    }
  },

  fetchReport: async (params) => {
    try {
      set(loadingState('isLoadingReport', true))
      const data = await productApi.getReport(params)
      set({ report: data, ...loadingState('isLoadingReport', false) })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Không thể tải báo cáo kho')
      toast.error(msg)
      set(loadingState('isLoadingReport', false))
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }))
  },

  createProduct: async (data) => {
    try {
      await productApi.createProduct(data)
      toast.success('Thêm sản phẩm thành công')
      await get().fetchProducts()
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Thêm sản phẩm thất bại')
      toast.error(msg)
      throw error
    }
  },

  updateProduct: async (id, data) => {
    try {
      await productApi.updateProduct(id, data)
      toast.success('Cập nhật sản phẩm thành công')
      await get().fetchProducts()
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Cập nhật sản phẩm thất bại')
      toast.error(msg)
      throw error
    }
  },

  deleteProduct: async (id) => {
    try {
      await productApi.deleteProduct(id)
      toast.success('Xóa sản phẩm thành công')
      await get().fetchProducts()
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Xóa sản phẩm thất bại')
      toast.error(msg)
    }
  },

  fetchCategories: async () => {
    try {
      const data = await categoryApi.getAll()
      set({ categories: data })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Không thể tải danh mục')
      toast.error(msg)
    }
  },

  fetchSuppliers: async () => {
    try {
      const response = await supplierApi.getSuppliers()
      set({ suppliers: response.data })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Không thể tải nhà cung cấp')
      toast.error(msg)
    }
  },
}))