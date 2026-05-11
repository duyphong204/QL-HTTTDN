import { create } from "zustand";
import type { StockOut } from "@/types/stockOut.types";

interface StockOutState {
  stockOuts: StockOut[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  setStockOuts: (stockOuts: StockOut[]) => void;
  setLoading: (isLoading: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStockOutStore = create<StockOutState>((set) => ({
  stockOuts: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  setStockOuts: (stockOuts) => set({ stockOuts }),
  setLoading: (isLoading) => set({ isLoading }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
}));
