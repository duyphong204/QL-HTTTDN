import { create } from "zustand";
import type { HrStatisticsReport } from "@/types/report.types";

interface HrStatisticsState {
  statistics: HrStatisticsReport | null;
  isLoading: boolean;
  setStatistics: (statistics: HrStatisticsReport | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useHrStatisticsStore = create<HrStatisticsState>((set) => ({
  statistics: null,
  isLoading: false,
  setStatistics: (statistics) => set({ statistics }),
  setLoading: (isLoading) => set({ isLoading }),
}));
