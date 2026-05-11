import { create } from "zustand";
import { toast } from "sonner";
import { reportService } from "@/services/report.service";
import { getErrorMessage } from "@/stores/store.helpers";
import type {
  HrReport,
  ReportQuery,
  ReportType,
  SalesReport,
  WarehouseReport,
} from "@/types/report.type";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentQuarter = Math.ceil(currentMonth / 3);

const defaultFilters: ReportQuery = {
  type: "year",
  year: currentYear,
  month: currentMonth,
  quarter: currentQuarter,
};

interface ReportState {
  filters: ReportQuery;
  sales: SalesReport | null;
  warehouse: WarehouseReport | null;
  hr: HrReport | null;
  loadingSales: boolean;
  loadingWarehouse: boolean;
  loadingHr: boolean;

  setFilters: (patch: Partial<ReportQuery>) => void;
  resetFilters: () => void;
  setReportType: (type: ReportType) => void;

  fetchSales: () => Promise<void>;
  fetchWarehouse: () => Promise<void>;
  fetchHr: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  filters: { ...defaultFilters },
  sales: null,
  warehouse: null,
  hr: null,
  loadingSales: false,
  loadingWarehouse: false,
  loadingHr: false,

  setFilters: (patch) =>
    set((s) => ({ filters: { ...s.filters, ...patch } })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  setReportType: (type) =>
    set((s) => ({ filters: { ...s.filters, type } })),

  fetchSales: async () => {
    set({ loadingSales: true });
    try {
      const filters = get().filters;
      const data = await reportService.getSales(filters);
      set({ sales: data });
    } catch (err) {
      set({ sales: null });
      toast.error(getErrorMessage(err, "Lỗi tải báo cáo bán hàng"));
    } finally {
      set({ loadingSales: false });
    }
  },

  fetchWarehouse: async () => {
    set({ loadingWarehouse: true });
    try {
      const filters = get().filters;
      const data = await reportService.getWarehouse(filters);
      set({ warehouse: data });
    } catch (err) {
      set({ warehouse: null });
      toast.error(getErrorMessage(err, "Lỗi tải báo cáo kho"));
    } finally {
      set({ loadingWarehouse: false });
    }
  },

  fetchHr: async () => {
    set({ loadingHr: true });
    try {
      const filters = get().filters;
      const data = await reportService.getHr(filters);
      set({ hr: data });
    } catch (err) {
      set({ hr: null });
      toast.error(getErrorMessage(err, "Lỗi tải báo cáo nhân sự"));
    } finally {
      set({ loadingHr: false });
    }
  },

  fetchAll: async () => {
    await Promise.all([
      get().fetchSales(),
      get().fetchWarehouse(),
      get().fetchHr(),
    ]);
  },
}));
