import { create } from "zustand";
import { productApi, categoryApi } from "@/api/warehouse.api";
import type {
  Product,
  Category,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/warehouse.type";
import { toast } from "sonner";

interface WarehouseState {
  // Products
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  productFilters: {
    page: number;
    limit: number;
    search: string;
    sortBy: string;
    order: "asc" | "desc";
    categoryId?: string;
  };

  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Actions
  actions: {
    // Product actions
    setProductFilters: (
      filters: Partial<WarehouseState["productFilters"]>,
    ) => void;
    fetchProducts: () => Promise<void>;
    addProduct: (data: CreateProductDto) => Promise<void>;
    updateProduct: (id: string, data: UpdateProductDto) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    getProductById: (id: string) => Promise<Product | null>;

    // Category actions
    fetchCategories: () => Promise<void>;
    addCategory: (data: CreateCategoryDto) => Promise<void>;
    updateCategory: (id: string, data: UpdateCategoryDto) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
  };
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  // Products state
  products: [],
  productsLoading: false,
  productsError: null,
  productFilters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "id",
    order: "desc",
    categoryId: undefined,
  },

  // Categories state
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  actions: {
    // Product actions
    setProductFilters: async (newFilters) => {
      set((state) => ({
        productFilters: { ...state.productFilters, ...newFilters },
      }));

      await get().actions.fetchProducts();
    },

    fetchProducts: async () => {
      const { productFilters } = get();
      set({ productsLoading: true, productsError: null });
      try {
        const params = {
          page: productFilters.page,
          limit: productFilters.limit,
          search: productFilters.search || undefined,
          sortBy: productFilters.sortBy,
          sortOrder: productFilters.order,
          categoryId: productFilters.categoryId,
        };
        const response = await productApi.getProducts(params);
        const data = response.items || [];

        set({ products: data, productsLoading: false });
      } catch (error: any) {
        console.error("Error fetching products:", error);
        set({
          products: [],
          productsLoading: false,
          productsError: error.message || "Failed to fetch products",
        });
        toast.error(
          "Lấy danh sách sản phẩm thất bại: " +
            (error.message || "Unknown error"),
        );
      } 
    },

    addProduct: async (data) => {
      set({ productsLoading: true, productsError: null });
      try {
        await productApi.createProduct(data);
        toast.success("Thêm sản phẩm thành công");
        get().actions.fetchProducts();
      } catch (error: any) {
        set({ productsError: error.message, productsLoading: false });
        toast.error("Thêm sản phẩm thất bại: " + error.message);
        throw error;
      }
    },

    updateProduct: async (id, data) => {
      set({ productsLoading: true, productsError: null });
      try {
        await productApi.updateProduct(id, data);
        toast.success("Cập nhật sản phẩm thành công");
        get().actions.fetchProducts();
      } catch (error: any) {
        set({ productsError: error.message, productsLoading: false });
        toast.error("Cập nhật sản phẩm thất bại: " + error.message);
        throw error;
      }
    },

    deleteProduct: async (id) => {
      set({ productsLoading: true, productsError: null });
      try {
        await productApi.deleteProduct(id);
        toast.success("Xóa sản phẩm thành công");
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          productsLoading: false,
        }));
      } catch (error: any) {
        set({ productsError: error.message, productsLoading: false });
        toast.error("Xóa sản phẩm thất bại: " + error.message);
      }
    },

    getProductById: async (id) => {
      try {
        const product = await productApi.getProductById(id);
        return product;
      } catch (error: any) {
        console.error("Error fetching product:", error);
        toast.error("Lấy thông tin sản phẩm thất bại: " + error.message);
        return null;
      }
    },

    // Category actions
    fetchCategories: async () => {
      set({ categoriesLoading: true, categoriesError: null });
      try {
        const response = await categoryApi.getCategories();
        const categories = Array.isArray(response) ? response : [];
        set({ categories, categoriesLoading: false });
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        set({
          categories: [],
          categoriesLoading: false,
          categoriesError: error.message || "Failed to fetch categories",
        });
        toast.error(
          "Lấy danh sách danh mục thất bại: " +
            (error.message || "Unknown error"),
        );
      }
    },

    addCategory: async (data) => {
      set({ categoriesLoading: true, categoriesError: null });
      try {
        await categoryApi.createCategory(data);
        toast.success("Thêm danh mục thành công");
        get().actions.fetchCategories();
      } catch (error: any) {
        set({ categoriesError: error.message, categoriesLoading: false });
        toast.error("Thêm danh mục thất bại: " + error.message);
        throw error;
      }
    },

    updateCategory: async (id, data) => {
      set({ categoriesLoading: true, categoriesError: null });
      try {
        await categoryApi.updateCategory(id, data);
        toast.success("Cập nhật danh mục thành công");
        get().actions.fetchCategories();
      } catch (error: any) {
        set({ categoriesError: error.message, categoriesLoading: false });
        toast.error("Cập nhật danh mục thất bại: " + error.message);
        throw error;
      }
    },

    deleteCategory: async (id) => {
      set({ categoriesLoading: true, categoriesError: null });
      try {
        await categoryApi.deleteCategory(id);
        toast.success("Xóa danh mục thành công");
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          categoriesLoading: false,
        }));
      } catch (error: any) {
        set({ categoriesError: error.message, categoriesLoading: false });
        toast.error("Xóa danh mục thất bại: " + error.message);
      }
    },
  },
}));
