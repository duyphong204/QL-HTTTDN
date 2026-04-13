import { create } from "zustand";
import { toast } from "sonner";
import { stockOutService } from "@/services/sales.service";
import { productService } from "@/services/warehouse.service";
import type {
  CreateStockOutDto,
  StockOut,
  StockOutQuery,
  UpdateStockOutDto,
} from "@/types/stockOut.types";
import type { Product } from "@/types/product.types";
import { getErrorMessage } from "@/stores/store.helpers";

interface StockOutState {
  stockOuts: StockOut[];
  productOptions: Product[];
  isLoading: boolean;
  isLoadingProducts: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchStockOuts: (query?: StockOutQuery) => Promise<void>;
  fetchProducts: () => Promise<void>;
  createStockOut: (data: CreateStockOutDto) => Promise<void>;
  updateStockOut: (id: string, data: UpdateStockOutDto) => Promise<void>;
  deleteStockOut: (id: string) => Promise<void>;
  getStockOutById: (id: string) => Promise<StockOut>;
}

export const useStockOutStore = create<StockOutState>((set) => ({
  stockOuts: [],
  productOptions: [],
  isLoading: false,
  isLoadingProducts: false,
  isSubmitting: false,
  error: null,

  fetchStockOuts: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const data = await stockOutService.getStockOuts(query);
      set({ stockOuts: data });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProducts: async () => {
    set({ isLoadingProducts: true, error: null });
    try {
      const response = await productService.getProducts({
        page: 1,
        limit: 200,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      set({ productOptions: response.data });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  createStockOut: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const newStockOut = await stockOutService.createStockOut(data);
      set((state) => ({
        stockOuts: [newStockOut, ...state.stockOuts],
      }));
      toast.success('Tạo phiếu xuất thành công');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateStockOut: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await stockOutService.updateStockOut(id, data);
      set((state) => ({
        stockOuts: state.stockOuts.map((stockOut) =>
          stockOut.id === id ? updated : stockOut,
        ),
      }));
      toast.success('Cập nhật phiếu xuất thành công');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStockOut: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await stockOutService.deleteStockOut(id);
      set((state) => ({
        stockOuts: state.stockOuts.filter((stockOut) => stockOut.id !== id),
      }));
      toast.success('Xóa phiếu xuất thành công');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ error: message });
      toast.error(message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getStockOutById: async (id) => {
    try {
      return await stockOutService.getStockOutById(id);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },
}));
