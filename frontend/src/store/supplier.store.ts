import { create } from "zustand";
import { supplierApi } from "@/api/warehouse.api";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/warehouse.type";
import { toast } from "sonner";

interface SupplierState {
    suppliers: Supplier[];
    isLoading: boolean;
    error: string | null;
    filters: {
        page: number;
        limit: number;
        search: string;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    actions: {
        setFilters: (filters: Partial<SupplierState["filters"]>) => void;
        fetchSuppliers: () => Promise<void>;
        addSupplier: (data: CreateSupplierDto) => Promise<void>;
        updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<void>;
        deleteSupplier: (id: string) => Promise<void>;
    };
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return "Unknown error occurred";
};

export const useSupplierStore = create<SupplierState>((set, get) => ({
    suppliers: [],
    isLoading: false,
    error: null,
    filters: {
        page: 1,
        limit: 10,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    },
    actions: {
        setFilters: (newFilters) => {
            set((state) => ({
                filters: { ...state.filters, ...newFilters },
            }));
            get().actions.fetchSuppliers();
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
                set({ suppliers, isLoading: false });
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                console.error("Error fetching suppliers:", error);
                
                set({
                    suppliers: [],
                    isLoading: false,
                    error: errorMessage || "Failed to fetch suppliers",
                });
                toast.error("Lấy danh sách nhà cung cấp thất bại: " + (errorMessage || "Unknown error"));
            }
        },

        addSupplier: async (data) => {
            set({ isLoading: true, error: null });
            try {
                await supplierApi.createSupplier(data);
                toast.success("Thêm nhà cung cấp thành công");
                get().actions.fetchSuppliers();
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, isLoading: false });
                toast.error("Thêm nhà cung cấp thất bại: " + errorMessage);
                throw error;
            }
        },

        updateSupplier: async (id, data) => {
            set({ isLoading: true, error: null });
            try {
                await supplierApi.updateSupplier(id, data);
                toast.success("Cập nhật nhà cung cấp thành công");
                get().actions.fetchSuppliers();
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, isLoading: false });
                toast.error("Cập nhật nhà cung cấp thất bại: " + errorMessage);
                throw error;
            }
        },

        deleteSupplier: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await supplierApi.deleteSupplier(id);
                toast.success("Xóa nhà cung cấp thành công");
                set((state) => ({
                    suppliers: state.suppliers.filter((s) => s.id !== id),
                    isLoading: false,
                }));
            } catch (error: unknown) {
                const errorMessage = getErrorMessage(error);
                set({ error: errorMessage, isLoading: false });
                toast.error("Xóa nhà cung cấp thất bại: " + errorMessage);
            }
        },
    },
}));