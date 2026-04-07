import { create } from 'zustand'
import { toast } from 'sonner'
import { stockInApi, productApi, supplierApi } from '@/api/warehouse.api'
import type { CreateStockInDto, Product, StockIn, Supplier } from '@/types/warehouse.type'
import { getErrorMessage } from '@/store/store.helpers'

interface StockInState {
  stockIns: StockIn[]
  products: Product[]
  suppliers: Supplier[]
  selectedStockIn: StockIn | null
  isLoading: boolean
  fetchStockIns: () => Promise<void>
  fetchReferenceData: () => Promise<void>
  fetchStockInById: (id: string) => Promise<void>
  clearSelectedStockIn: () => void
  createTicket: (data: CreateStockInDto) => Promise<void>
  confirmTicket: (id: string) => Promise<void>
}

export const useStockInStore = create<StockInState>((set, get) => ({
  stockIns: [],
  products: [],
  suppliers: [],
  selectedStockIn: null,
  isLoading: false,

  fetchStockIns: async () => {
    set({ isLoading: true })
    try {
      const data = await stockInApi.getStockIns()
      set({ stockIns: data, isLoading: false })
    } catch (error: unknown) {
      set({ isLoading: false })
      const msg = getErrorMessage(error, 'Lỗi khi tải danh sách phiếu nhập kho')
      toast.error(msg)
      throw error
    }
  },

  fetchReferenceData: async () => {
    try {
      const [productsResponse, suppliersResponse] = await Promise.all([
        productApi.getProducts({
          page: 1,
          limit: 200,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
        supplierApi.getSuppliers({
          page: 1,
          limit: 200,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
      ])

      set({
        products: productsResponse.data,
        suppliers: suppliersResponse.data,
      })
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Lỗi khi tải dữ liệu sản phẩm và nhà cung cấp')
      toast.error(msg)
      throw error
    }
  },

  fetchStockInById: async (id: string) => {
    set({ isLoading: true, selectedStockIn: null })
    try {
      const data = await stockInApi.getStockInById(id)
      set({ selectedStockIn: data, isLoading: false })
    } catch (error: unknown) {
      set({ isLoading: false })
      const msg = getErrorMessage(error, 'Lỗi khi tải thông tin phiếu nhập kho')
      toast.error(msg)
      throw error
    }
  },

  clearSelectedStockIn: () => {
    set({ selectedStockIn: null })
  },

  confirmTicket: async (id: string) => {
    set({ isLoading: true })
    try {
      await stockInApi.confirmStockIn(id)
      toast.success('Xác nhận nhập kho thành công. Tồn kho đã được cập nhật!')
      await get().fetchStockIns()

      if (get().selectedStockIn?.id === id) {
        await get().fetchStockInById(id)
      }
      await get().fetchReferenceData()
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Xác nhận nhập kho thất bại')
      toast.error(msg)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  createTicket: async (data: CreateStockInDto) => {
    set({ isLoading: true })
    try {
      await stockInApi.createStockIn(data)
      toast.success('Tạo phiếu nhập kho thành công')
      await Promise.all([get().fetchStockIns(), get().fetchReferenceData()])
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Tạo phiếu nhập kho thất bại')
      toast.error(msg)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))