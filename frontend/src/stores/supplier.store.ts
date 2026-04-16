import { create } from "zustand";
import type { Supplier } from "@/types/supplier.types";
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.types";
import { mergeFiltersWithPageReset } from "@/stores/store.helpers";

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
    setSuppliers: (suppliers: Supplier[]) => void;
    setMeta: (meta: PaginationMeta | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useSupplierStore = create<SupplierState>((set) => ({
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

    setSuppliers: (suppliers) => set({ suppliers }),
    setMeta: (meta) => set({ meta }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));
