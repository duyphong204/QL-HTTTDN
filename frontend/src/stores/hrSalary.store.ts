import { create } from "zustand";
import { toast } from "sonner";
import { salaryService } from "@/services/hr.service";
import { getErrorMessage } from "@/stores/store.helpers";
import type {
  Salary,
  AddSalaryDetailDto,
  SalaryStatus,
} from "@/types/salary.types";

interface Filters {
  page: number;
  limit: number;
  month?: number;
  year?: number;
  employeeId?: string;
  status?: SalaryStatus;
  search?: string;
}

export interface HrSalaryStatistics {
  totalEmployees: number;
  totalNetSalary: number;
  totalBonus: number;
  totalDeduction: number;
  totalInsurance: number;
  avgNetSalary: number;
  byStatus: {
    PENDING: number;
    APPROVED: number;
    PAID: number;
  };
  monthlyBreakdown: { month: number; total: number; count: number }[];
}

interface State {
  salaries: Salary[];
  total: number;
  isLoading: boolean;
  isCalculating: boolean;
  filters: Filters;

  statistics: HrSalaryStatistics | null;
  isLoadingStats: boolean;

  setFilters: (f: Partial<Filters>) => void;
  fetch: () => Promise<void>;
  calculateAll: (month: number, year: number) => Promise<void>;
  approve: (id: string) => Promise<void>;
  pay: (id: string) => Promise<void>;
  addDetail: (id: string, data: AddSalaryDetailDto) => Promise<void>;
  deleteDetail: (salaryId: string, detailId: string) => Promise<void>;
  fetchStatistics: (year: number, month?: number) => Promise<void>;
}

export const useHrSalaryStore = create<State>((set, get) => ({
  salaries: [],
  total: 0,
  isLoading: false,
  isCalculating: false,
  statistics: null,
  isLoadingStats: false,

  filters: {
    page: 1,
    limit: 10,
  },

  setFilters: (f) =>
    set((state) => ({
      filters: { ...state.filters, ...f, page: f.page ?? 1 },
    })),

  fetch: async () => {
    set({ isLoading: true });
    try {
      const res = await salaryService.getSalaries(get().filters);
      set({ salaries: res.data, total: res.meta?.total ?? 0 });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStatistics: async (year, month) => {
    set({ isLoadingStats: true });
    try {
      const res = await salaryService.getStatistics({ year, month });
      set({ statistics: res as HrSalaryStatistics });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      set({ isLoadingStats: false });
    }
  },

  calculateAll: async (month, year) => {
    set({ isCalculating: true });
    try {
      const res = await salaryService.calculateAll({ month, year });
      toast.success(res.message ?? "Tính lương thành công");
      await get().fetch();
      await get().fetchStatistics(year, month);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      set({ isCalculating: false });
    }
  },

  approve: async (id) => {
    try {
      await salaryService.approve(id);
      toast.success("Đã duyệt bảng lương");
      await get().fetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  },

  pay: async (id) => {
    try {
      await salaryService.pay(id);
      toast.success("Đã đánh dấu thanh toán");
      await get().fetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  },

  addDetail: async (id, data) => {
    try {
      await salaryService.addDetail(id, data);
      toast.success("Thêm chi tiết thành công");
      await get().fetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  },

  deleteDetail: async (salaryId, detailId) => {
    try {
      await salaryService.deleteDetail(salaryId, detailId);
      toast.success("Đã xóa chi tiết lương");
      await get().fetch();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  },
}));
