import { create } from 'zustand';
import { toast } from 'sonner';
import { categoryApi, productApi, supplierApi } from '@/api/warehouse.api';

import type {
  Product,
  ProductQuery,
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
  Category,
} from '@/types/warehouse.type';
import type { Supplier } from '@/types/supplier.type';

interface ProductState {
  products: Product[];
  meta?: ProductResponse['meta'];
  filters: ProductQuery;
  isLoading: boolean;
  categories: Category[];
  suppliers: Supplier[];
  fetchProducts: () => Promise<void>;
  setFilters: (filters: Partial<ProductQuery>) => void;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  meta: undefined,
  categories: [],
  suppliers: [],
  filters: {
    page: 1,
    limit: 10,
    search: '',
    categoryId: '',
    supplierId: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },

  isLoading: false,

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
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    const isPageChange = 'page' in newFilters;
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page: isPageChange ? (newFilters.page ?? 1) : 1,
      },
    }));
    get().fetchProducts();
  },

  createProduct: async (data) => {
    try {
      await productApi.createProduct(data);
      toast.success('Thêm sản phẩm thành công');
      await get().fetchProducts();
    } catch (error) {
      toast.error('Thêm sản phẩm thất bại');
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      await productApi.updateProduct(id, data);
      toast.success('Cập nhật sản phẩm thành công');
      await get().fetchProducts();
    } catch (error) {
      toast.error('Cập nhật sản phẩm thất bại');
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await productApi.deleteProduct(id);
      toast.success('Xóa sản phẩm thành công');
      await get().fetchProducts();
    } catch {
      toast.error('Xóa sản phẩm thất bại');
    }
  },
  fetchCategories: async () => {
    try {
      const data = await categoryApi.getCategories();
      set({ categories: data });
    } catch {
      toast.error("Không thể tải danh mục");
    }
  },

  fetchSuppliers: async () => {
    try {
      const data = await supplierApi.getSuppliers();
      set({ suppliers: Array.isArray(data) ? data : data.data ?? [] });
    } catch {
      toast.error("Không thể tải nhà cung cấp");
    }
  },
}));