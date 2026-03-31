import { create } from "zustand";
import { supplierApi } from "@/api/warehouse.api";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/warehouse.type";
import { toast } from "sonner";
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.type";

type SupplierFilters = BaseFilters & {
    sortBy: string;
    sortOrder: SortOrder;
};

interface SupplierState {
    suppliers: Supplier[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    error: string | null;
    filters: SupplierFilters;
    setFilters: (filters: Partial<SupplierFilters>) => void;
    fetchSuppliers: () => Promise<void>;
    addSupplier: (data: CreateSupplierDto) => Promise<void>;
    updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return "Đã xảy ra lỗi không xác định";
};

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
        const isPageChange = 'page' in newFilters;
        set((state) => ({
            filters: {
                ...state.filters,
                ...newFilters,
                page: isPageChange ? (newFilters.page ?? 1) : 1,
            },
        }));
    },

    fetchSuppliers: async () => {
        const { filters } = get();
        set({ isLoading: true, error: null });
        try {
            const response = await supplierApi.getSuppliers({
                page: filters.page,
                limit: filters.limit,
                search: filters.search,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            });
            const suppliers = Array.isArray(response) ? response : response.data || [];
            set({
                suppliers,
                meta: Array.isArray(response) ? null : response.meta,
                isLoading: false,
            });
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            set({ suppliers: [], isLoading: false, error: errorMessage });
            toast.error("Lấy dữ liệu thất bại: " + errorMessage);
        }
    },

    addSupplier: async (data) => {
        set({ isLoading: true });
        try {
            await supplierApi.createSupplier(data);
            toast.success("Thêm thành công");
            await get().fetchSuppliers();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    updateSupplier: async (id, data) => {
        set({ isLoading: true });
        try {
            await supplierApi.updateSupplier(id, data);
            toast.success("Cập nhật thành công");
            await get().fetchSuppliers();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    deleteSupplier: async (id) => {
        set({ isLoading: true });
        try {
            await supplierApi.deleteSupplier(id);
            toast.success("Xóa thành công");
            await get().fetchSuppliers();
        } catch {
            set({ isLoading: false });
        }
    },
}));