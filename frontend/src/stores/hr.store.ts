import { create } from "zustand";
import { toast } from "sonner";
import { employeeService, salaryService } from "@/services/hr.service";
import type { HrStatisticsReport, Salary } from "@/types/hr.type";

interface HrStoreState {
  statistics: HrStatisticsReport | null;
  salaries: Salary[];
  loadingStatistics: boolean;
  loadingSalaries: boolean;
  fetchStatistics: (params?: { month?: number; year?: number }) => Promise<void>;
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
      const statistics = await employeeService.getHrStatistics(params);
      set({ statistics });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tải thống kê HR");
    } finally {
      set({ loadingStatistics: false });
    }
  },

  fetchSalaries: async (params) => {
    set({ loadingSalaries: true });
    try {
      const salaries = await salaryService.getSalaries(params);
      set({ salaries : salaries.data });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tải danh sách lương");
      // Đã xóa dấu phẩy thừa ở đây
    } finally {
      set({ loadingSalaries: false });
    }
  },
}));