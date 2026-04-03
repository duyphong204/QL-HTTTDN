import { create } from "zustand"
import { supplierApi } from "@/api/warehouse.api"
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/warehouse.type"
import { toast } from "sonner"
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.type"
import { getErrorMessage, loadingState, mergeFiltersWithPageReset } from "@/store/store.helpers"

type SupplierFilters = BaseFilters & {
    sortBy: string
    sortOrder: SortOrder
}

interface SupplierState {
    suppliers: Supplier[]
    meta: PaginationMeta | null
    isLoading: boolean
    error: string | null
    filters: SupplierFilters
    setFilters: (filters: Partial<SupplierFilters>) => void
    fetchSuppliers: () => Promise<void>
    addSupplier: (data: CreateSupplierDto) => Promise<void>
    updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<void>
    deleteSupplier: (id: string) => Promise<void>
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
    suppliers: [],
    meta: null,
    isLoading: false,
    error: null,
    filters: {
        page: 1,
        limit: 10,
        search: "",
        sortBy: "name",
        sortOrder: "asc",
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: mergeFiltersWithPageReset(state.filters, newFilters),
        }))
    },

    fetchSuppliers: async () => {
        const { filters } = get()
        set({ ...loadingState("isLoading", true), error: null })
        try {
            const response = await supplierApi.getSuppliers(filters)
            set({
                suppliers: response.data,
                meta: response.meta,
                ...loadingState("isLoading", false),
            })
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Không thể tải danh sách nhà cung cấp")
            set({ suppliers: [], ...loadingState("isLoading", false), error: msg })
            toast.error(msg)
        }
    },

    addSupplier: async (data) => {
        try {
            await supplierApi.createSupplier(data)
            toast.success("Thêm nhà cung cấp thành công")
            await get().fetchSuppliers()
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Thêm nhà cung cấp thất bại")
            toast.error(msg)
            throw error
        }
    },

    updateSupplier: async (id, data) => {
        try {
            await supplierApi.updateSupplier(id, data)
            toast.success("Cập nhật nhà cung cấp thành công")
            await get().fetchSuppliers()
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Cập nhật nhà cung cấp thất bại")
            toast.error(msg)
            throw error
        }
    },

    deleteSupplier: async (id) => {
        try {
            await supplierApi.deleteSupplier(id)
            toast.success("Xóa nhà cung cấp thành công")
            await get().fetchSuppliers()
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Xóa nhà cung cấp thất bại")
            toast.error(msg)
        }
    },
}))