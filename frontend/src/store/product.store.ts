import { create } from "zustand";
import { toast } from "sonner";
import { categoryApi, productApi } from "@/api/warehouse.api";

import type {
  Product,
  Category,
  ProductQuery,
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from "@/types/warehouse.type";

interface ProductState {
  products: Product[];
  categories: Category[];
  meta?: ProductResponse["meta"];
  filters: ProductQuery;
  isLoading: boolean;
  isCategoryLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchProductsByQuery: (
    query: ProductQuery,
  ) => Promise<ProductResponse | null>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: Partial<ProductQuery>) => void;
  setPage: (page: number) => void;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Lỗi không xác định";

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  meta: undefined,

  filters: {
    page: 1,
    limit: 9,
    search: "",
    categoryId: "",
    supplierId: "",
    sortBy: "featured",
  },

  isLoading: false,
  isCategoryLoading: false,

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      const { filters } = get();
      const res = await productApi.getProducts(filters);

      set({
        products: res.data,
        meta: res.meta,
        isLoading: false,
      });
    } catch (error) {
      toast.error(toErrorMessage(error));
      set({ isLoading: false });
    }
  },

  fetchProductsByQuery: async (query) => {
    try {
      return await productApi.getProducts(query);
    } catch (error) {
      toast.error(toErrorMessage(error));
      return null;
    }
  },

  fetchProductById: async (id) => {
    try {
      return await productApi.getProductById(id);
    } catch (error) {
      toast.error(toErrorMessage(error));
      return null;
    }
  },

  fetchCategories: async () => {
    try {
      set({ isCategoryLoading: true });
      const res = await categoryApi.getCategories();
      set({ categories: res, isCategoryLoading: false });
    } catch (error) {
      toast.error(toErrorMessage(error));
      set({ categories: [], isCategoryLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page: 1,
      },
    }));
    get().fetchProducts();
  },

  setPage: (page: number) => {
    set({
      filters: {
        ...get().filters,
        page,
      },
    });
    get().fetchProducts();
  },

  createProduct: async (data) => {
    try {
      await productApi.createProduct(data);
      toast.success("Thêm sản phẩm thành công");
      await get().fetchProducts();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  updateProduct: async (id, data) => {
    try {
      await productApi.updateProduct(id, data);
      toast.success("Cập nhật sản phẩm thành công");
      await get().fetchProducts();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },

  deleteProduct: async (id) => {
    try {
      await productApi.deleteProduct(id);
      toast.success("Xóa sản phẩm thành công");
      await get().fetchProducts();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  },
}));
