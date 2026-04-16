import { create } from 'zustand'
import type { Product, ProductResponse } from '@/types/product.types'
import type { BaseFilters, SortOrder } from '@/types/common.types'
import { mergeFiltersWithPageReset } from '@/stores/store.helpers'

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
  isLoading: boolean
  setProducts: (products: Product[]) => void
  setMeta: (meta?: ProductResponse['meta']) => void
  setFilters: (filters: Partial<ProductFilters>) => void
  setLoading: (isLoading: boolean) => void
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  meta: undefined,
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

  setProducts: (products) => set({ products }),
  setMeta: (meta) => set({ meta }),

  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }))
  },
  setLoading: (isLoading) => set({ isLoading }),
}))

export type { ProductFilters }
