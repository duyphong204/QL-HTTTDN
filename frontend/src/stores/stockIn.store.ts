import { create } from "zustand";
import { toast } from "sonner";
import {
  stockInService,
  productService,
  supplierService,
} from "@/services/warehouse.service";
import { getErrorMessage } from "@/stores/store.helpers";
import type { StockIn, StockInDetailInput } from "@/types/stockIn.types";
import type { Product, Supplier } from "@/types/warehouse.type";

const emptyDetail = (): StockInDetailInput => ({
  productId: "",
  quantity: 1,
  price: 0,
});

interface StockInState {
  // ================= DATA STATE =================
  stockIns: StockIn[];
  selectedStockIn: StockIn | null;
  products: Product[];
  suppliers: Supplier[];

  // ================= UI STATE =================
  formOpen: boolean;
  editingId: string | null;
  supplierId: string;
  details: StockInDetailInput[];

  // ================= LOADING/ERROR STATE =================
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;

  // ================= FETCHING ACTIONS =================
  fetchStockIns: () => Promise<void>;
  fetchReferenceData: () => Promise<void>;
  fetchStockInById: (id: string) => Promise<void>;

  // ================= CRUD ACTIONS =================
  createStockIn: (
    payload: { supplierId: string; details: StockInDetailInput[] }
  ) => Promise<void>;
  updateStockIn: (
    id: string,
    payload: { supplierId: string; details: StockInDetailInput[] }
  ) => Promise<void>;
  deleteStockIn: (id: string) => Promise<void>;

  // ================= FORM UI ACTIONS =================
  openCreateModal: () => void;
  openEditModal: (stockIn: StockIn) => void;
  closeFormModal: () => void;
  openDetailModal: (id: string) => Promise<void>;
  closeDetailModal: () => void;
  resetForm: () => void;

  // ================= FORM STATE ACTIONS =================
  setSupplierId: (id: string) => void;
  addDetail: () => void;
  removeDetail: (index: number) => void;
  updateDetail: (
    index: number,
    field: keyof StockInDetailInput,
    value: string | number
  ) => void;

  // ================= INTERNAL HELPERS =================
  setLoading: (loading: boolean) => void;
  setLoadingDetail: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStockIns: (stockIns: StockIn[]) => void;
  setSelectedStockIn: (stockIn: StockIn | null) => void;
  clearSelectedStockIn: () => void;
}

export const useStockInStore = create<StockInState>((set, get) => ({
  // ================= INITIAL STATE =================
  stockIns: [],
  selectedStockIn: null,
  products: [],
  suppliers: [],
  formOpen: false,
  editingId: null,
  supplierId: "",
  details: [emptyDetail()],
  isLoading: false,
  isLoadingDetail: false,
  error: null,

  // ================= FETCHING ACTIONS =================
  fetchStockIns: async () => {
    get().setLoading(true);
    get().setError(null);
    try {
      const data = await stockInService.getStockIns();
      get().setStockIns(data);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      get().setError(message);
      toast.error(message);
    } finally {
      get().setLoading(false);
    }
  },

  fetchReferenceData: async () => {
    try {
      const [productResponse, supplierResponse] = await Promise.all([
        productService.getProducts(),
        supplierService.getSuppliers(),
      ]);
      set({
        products: productResponse.data,
        suppliers: supplierResponse.data,
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  },

  fetchStockInById: async (id: string) => {
    get().setLoadingDetail(true);
    try {
      const data = await stockInService.getStockInById(id);
      get().setSelectedStockIn(data);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      get().setLoadingDetail(false);
    }
  },

  // ================= CRUD ACTIONS =================
  createStockIn: async (payload) => {
    const { supplierId, details } = payload;

    // Validation
    if (!supplierId) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (!details || details.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    // Validate each detail
    const hasInvalidDetail = details.some(
      (detail) =>
        !detail.productId || detail.quantity <= 0 || detail.price < 0
    );

    if (hasInvalidDetail) {
      toast.error("Vui lòng kiểm tra lại: sản phẩm, số lượng > 0, giá >= 0");
      return;
    }

    try {
      const newStockIn = await stockInService.createStockIn(payload);
      // Prepend to list
      get().setStockIns([newStockIn, ...get().stockIns]);
      get().resetForm();
      toast.success("Tạo phiếu nhập thành công");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      get().setError(message);
      toast.error(message);
    }
  },

  updateStockIn: async (id, payload) => {
    const { supplierId, details } = payload;

    // Validation
    if (!supplierId) {
      toast.error("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (!details || details.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    const hasInvalidDetail = details.some(
      (detail) =>
        !detail.productId || detail.quantity <= 0 || detail.price < 0
    );

    if (hasInvalidDetail) {
      toast.error("Vui lòng kiểm tra lại: sản phẩm, số lượng > 0, giá >= 0");
      return;
    }

    try {
      const updated = await stockInService.updateStockIn(id, payload);
      // Update in list
      get().setStockIns(
        get().stockIns.map((s) => (s.id === id ? updated : s))
      );
      get().resetForm();
      toast.success("Cập nhật phiếu nhập thành công");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      get().setError(message);
      toast.error(message);
    }
  },

  deleteStockIn: async (id) => {
    try {
      await stockInService.deleteStockIn(id);
      // Optimistic update: remove immediately
      get().setStockIns(get().stockIns.filter((s) => s.id !== id));
      toast.success("Xóa phiếu nhập thành công");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      get().setError(message);
      toast.error(message);
    }
  },

  // ================= FORM UI ACTIONS =================
  openCreateModal: () => {
    set({
      formOpen: true,
      editingId: null,
      supplierId: "",
      details: [emptyDetail()],
      error: null,
    });
  },

  openEditModal: (stockIn: StockIn) => {
    set({
      formOpen: true,
      editingId: stockIn.id,
      supplierId: stockIn.supplierId,
      details: (stockIn.details ?? []).map((detail) => ({
        productId: detail.productId,
        quantity: detail.quantity,
        price: detail.price,
      })),
      error: null,
    });
  },

  closeFormModal: () => {
    get().resetForm();
  },

  openDetailModal: async (id: string) => {
    await get().fetchStockInById(id);
  },

  closeDetailModal: () => {
    get().clearSelectedStockIn();
  },

  resetForm: () => {
    set({
      formOpen: false,
      editingId: null,
      supplierId: "",
      details: [emptyDetail()],
      error: null,
    });
  },

  // ================= FORM STATE ACTIONS =================
  setSupplierId: (id: string) => {
    set({ supplierId: id });
  },

  addDetail: () => {
    set({
      details: [...get().details, emptyDetail()],
    });
  },

  removeDetail: (index: number) => {
    const currentDetails = get().details;
    // Always keep at least 1 detail
    if (currentDetails.length <= 1) return;

    set({
      details: currentDetails.filter((_, i) => i !== index),
    });
  },

  updateDetail: (index, field, value) => {
    const currentDetails = get().details;
    set({
      details: currentDetails.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    });
  },

  // ================= INTERNAL HELPERS =================
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingDetail: (loading) => set({ isLoadingDetail: loading }),
  setError: (error) => set({ error }),
  setStockIns: (stockIns) => set({ stockIns }),
  setSelectedStockIn: (stockIn) => set({ selectedStockIn: stockIn }),
  clearSelectedStockIn: () => set({ selectedStockIn: null }),
}));