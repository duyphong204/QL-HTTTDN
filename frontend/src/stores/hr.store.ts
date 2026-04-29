import { create } from "zustand";
import { toast } from "sonner";
import { employeeApi, salaryApi } from "@/api/hr.api";
import type { HrStatisticsReport, Salary } from "@/types/hr.type";

interface HrStoreState {
  statistics: HrStatisticsReport | null;
  salaries: Salary[];
  loadingStatistics: boolean;
  loadingSalaries: boolean;
  fetchStatistics: (params?: {
    month?: number;
    year?: number;
  }) => Promise<void>;
  fetchSalaries: (params?: { month?: number; year?: number }) => Promise<void>;
}

export const useHrStore = create<HrStoreState>((set) => ({
  statistics: null,
  salaries: [],
  loadingStatistics: false,
  loadingSalaries: false,

  fetchStatistics: async (params) => {
    set({ loadingStatistics: true });
    try {
      const statistics = await employeeApi.getHrStatistics(params);
      set({ statistics });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi tải thống kê HR",
      );
    } finally {
      set({ loadingStatistics: false });
    }
  },

  fetchSalaries: async (params) => {
    set({ loadingSalaries: true });
    try {
      const salaries = await salaryApi.getSalaries(params);
      set({ salaries });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi tải danh sách lương",
      );
    } finally {
      set({ loadingSalaries: false });
    }
  },
}));
