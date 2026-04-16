import { create } from 'zustand'
import type { Product } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'

interface WarehouseReferenceState {
  products: Product[]
  suppliers: Supplier[]
  isLoadingProducts: boolean
  isLoadingSuppliers: boolean
  setProducts: (products: Product[]) => void
  setSuppliers: (suppliers: Supplier[]) => void
  setLoadingProducts: (isLoading: boolean) => void
  setLoadingSuppliers: (isLoading: boolean) => void
}

export const useWarehouseReferenceStore = create<WarehouseReferenceState>((set) => ({
  products: [],
  suppliers: [],
  isLoadingProducts: false,
  isLoadingSuppliers: false,
  setProducts: (products) => set({ products }),
  setSuppliers: (suppliers) => set({ suppliers }),
  setLoadingProducts: (isLoadingProducts) => set({ isLoadingProducts }),
  setLoadingSuppliers: (isLoadingSuppliers) => set({ isLoadingSuppliers }),
}))
