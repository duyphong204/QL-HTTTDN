import { create } from "zustand";
import { toast } from "sonner";
import { supplierService } from "@/services/warehouse.service";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/warehouse.type";
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.type";
import { getErrorMessage, loadingState, mergeFiltersWithPageReset } from "@/stores/store.helpers";

type SupplierFilters = BaseFilters & {
    sortBy?: string;
    sortOrder?: SortOrder;
};

export type { SupplierFilters };

interface SupplierState {
    suppliers: Supplier[];
    meta: PaginationMeta | null;
    filters: SupplierFilters;
    isLoading: boolean;
    error: string | null;

    setFilters: (filters: Partial<SupplierFilters>) => void;
    fetchSuppliers: () => Promise<void>;
    createSupplier: (data: CreateSupplierDto) => Promise<void>;
    updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
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
        }));
    },

    fetchSuppliers: async () => {
        set({ ...loadingState("isLoading", true), error: null });
        try {
            const { filters } = get();
            const response = await supplierService.getSuppliers(filters);
            set({
                suppliers: response.data,
                meta: response.meta,
            });
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
        } finally {
            set(loadingState("isLoading", false));
        }
    },

    createSupplier: async (data) => {
        try {
            const newSupplier = await supplierService.createSupplier(data);
            set((state) => ({
                suppliers: [newSupplier, ...state.suppliers],
            }));
            toast.success("Thêm nhà cung cấp thành công");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
            throw err;
        }
    },

    updateSupplier: async (id, data) => {
        try {
            const updated = await supplierService.updateSupplier(id, data);
            set((state) => ({
                suppliers: state.suppliers.map((s) =>
                    s.id === id ? updated : s
                ),
            }));
            toast.success("Cập nhật nhà cung cấp thành công");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
            throw err;
        }
    },

    deleteSupplier: async (id) => {
        try {
            await supplierService.deleteSupplier(id);
            set((state) => ({
                suppliers: state.suppliers.filter((s) => s.id !== id),
            }));
            toast.success("Xóa nhà cung cấp thành công");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
        }
    },
}));
