import { create } from "zustand";
import { toast } from "sonner";
import { stockInService, productService, supplierService } from "@/services/warehouse.service";
import type { StockIn, CreateStockInDto, UpdateStockInDto } from "@/types/warehouse.type";
import type { Product } from "@/types/warehouse.type";
import type { Supplier } from "@/types/warehouse.type";
import { getErrorMessage } from "@/stores/store.helpers";

interface StockInState {
    stockIns: StockIn[];
    selectedStockIn: StockIn | null;
    products: Product[];
    suppliers: Supplier[];
    isLoading: boolean;
    isLoadingDetail: boolean;
    error: string | null;

    fetchStockIns: (params?: { productId?: string; startDate?: string; endDate?: string }) => Promise<void>;
    fetchStockInById: (id: string) => Promise<void>;
    createStockIn: (data: CreateStockInDto) => Promise<void>;
    updateStockIn: (id: string, data: Partial<UpdateStockInDto>) => Promise<void>;
    deleteStockIn: (id: string) => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchSuppliers: () => Promise<void>;
    fetchReferenceData: () => Promise<void>;
    clearSelectedStockIn: () => void;
}

export const useStockInStore = create<StockInState>((set, get) => ({
    stockIns: [],
    selectedStockIn: null,
    products: [],
    suppliers: [],
    isLoading: false,
    isLoadingDetail: false,
    error: null,

    fetchStockIns: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const data = await stockInService.getStockIns(params);
            set({ stockIns: data });
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStockInById: async (id) => {
        set({ isLoadingDetail: true });
        try {
            const data = await stockInService.getStockInById(id);
            set({ selectedStockIn: data });
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            toast.error(message);
        } finally {
            set({ isLoadingDetail: false });
        }
    },

    createStockIn: async (data) => {
        try {
            const newStockIn = await stockInService.createStockIn(data);
            set((state) => ({
                stockIns: [newStockIn, ...state.stockIns],
            }));
            toast.success("Tạo phiếu nhập thành công");
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
            throw error;
        }
    },

    updateStockIn: async (id, data) => {
        try {
            const updated = await stockInService.updateStockIn(id, data);
            set((state) => ({
                stockIns: state.stockIns.map((s) =>
                    s.id === id ? updated : s
                ),
            }));
            toast.success("Cập nhật phiếu nhập thành công");
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
            throw error;
        }
    },

    deleteStockIn: async (id) => {
        try {
            await stockInService.deleteStockIn(id);
            set((state) => ({
                stockIns: state.stockIns.filter((s) => s.id !== id),
            }));
            toast.success("Xóa phiếu nhập thành công");
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
        }
    },

    fetchProducts: async () => {
        try {
            const response = await productService.getProducts();
            set({ products: response.data });
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            toast.error(message);
        }
    },

    fetchSuppliers: async () => {
        try {
            const response = await supplierService.getSuppliers();
            set({ suppliers: response.data });
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            toast.error(message);
        }
    },

    fetchReferenceData: async () => {
        await Promise.all([get().fetchProducts(), get().fetchSuppliers()]);
    },

    clearSelectedStockIn: () => {
        set({ selectedStockIn: null });
    },
}));
