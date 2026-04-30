import { create } from "zustand";
import type { WarehouseReport } from "@/types/report.types";

interface ReportState {
  report: WarehouseReport | null;
  isLoading: boolean;
  setReport: (report: WarehouseReport | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  report: null,
  isLoading: false,
  setReport: (report) => set({ report }),
  setLoading: (isLoading) => set({ isLoading }),
}));
