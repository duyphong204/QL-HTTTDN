import { create } from "zustand";
import type { StockIn } from "@/types/stockIn.types";

interface StockInState {
  stockIns: StockIn[];
  selectedStockIn: StockIn | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  setStockIns: (stockIns: StockIn[]) => void;
  setSelectedStockIn: (stockIn: StockIn | null) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingDetail: (isLoadingDetail: boolean) => void;
  setError: (error: string | null) => void;
  clearSelectedStockIn: () => void;
}

export const useStockInStore = create<StockInState>((set) => ({
  stockIns: [],
  selectedStockIn: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  setStockIns: (stockIns) => set({ stockIns }),
  setSelectedStockIn: (selectedStockIn) => set({ selectedStockIn }),
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingDetail: (isLoadingDetail) => set({ isLoadingDetail }),
  setError: (error) => set({ error }),

  clearSelectedStockIn: () => {
    set({ selectedStockIn: null });
  },
}));
