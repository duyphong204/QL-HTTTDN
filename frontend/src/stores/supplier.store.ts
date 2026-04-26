import { create } from "zustand";
import { supplierService } from "@/services/warehouse.service";
import { getErrorMessage, mergeFiltersWithPageReset } from "@/stores/store.helpers";
import { toast } from "sonner";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/supplier.types";
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.types";

type SupplierFilters = BaseFilters & {
  sortBy?: string;
  sortOrder?: SortOrder;
};

interface SupplierState {
  suppliers: Supplier[];
  meta: PaginationMeta | null;
  filters: SupplierFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
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
    // Sau khi set filters, tự động fetch lại
    get().fetchSuppliers();
  },

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.getSuppliers(get().filters);
      set({ suppliers: response.data, meta: response.meta });
    } catch (err) {
      const message = getErrorMessage(err);
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  createSupplier: async (data) => {
    try {
      const newSupplier = await supplierService.createSupplier(data);
      set((state) => ({ suppliers: [newSupplier, ...state.suppliers] }));
      toast.success("Thêm nhà cung cấp thành công");
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  },

  updateSupplier: async (id, data) => {
    try {
      const updated = await supplierService.updateSupplier(id, data);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
      }));
      toast.success("Cập nhật nhà cung cấp thành công");
    } catch (err) {
      toast.error(getErrorMessage(err));
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
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  },
}));