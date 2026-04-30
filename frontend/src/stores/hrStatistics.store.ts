import { create } from "zustand";
import { toast } from "sonner";
import { employeeService } from "@/services/hr.service";
import { getErrorMessage } from "@/stores/store.helpers";
import type { HrStatisticsReport } from "@/types/report.types";

interface HrStatisticsState {
  statistics: HrStatisticsReport | null;
  isLoading: boolean;
  filterYear: number;
  filterMonth: number | undefined;

  setStatistics: (statistics: HrStatisticsReport | null) => void;
  setLoading: (isLoading: boolean) => void;
  setFilterYear: (year: number) => void;
  setFilterMonth: (month: number | undefined) => void;
  fetchStatistics: (params?: { month?: number; year?: number }) => Promise<void>;
}

export const useHrStatisticsStore = create<HrStatisticsState>((set, get) => ({
  statistics: null,
  isLoading: false,
  filterYear: new Date().getFullYear(),
  filterMonth: undefined,

  setStatistics: (statistics) => set({ statistics }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilterYear: (year) => {
    set({ filterYear: year });
    get().fetchStatistics({ year, month: get().filterMonth });
  },
  setFilterMonth: (month) => {
    set({ filterMonth: month });
    get().fetchStatistics({ year: get().filterYear, month });
  },

  fetchStatistics: async (params) => {
    set({ isLoading: true });
    try {
      const { filterYear, filterMonth } = get();
      const data = await employeeService.getHrStatistics({
        year: params?.year ?? filterYear,
        month: params?.month ?? filterMonth,
      });
      set({ statistics: data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải thống kê nhân sự"));
    } finally {
      set({ isLoading: false });
    }
  },
}));
