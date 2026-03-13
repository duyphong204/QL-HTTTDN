import { create } from 'zustand';
import { toast } from 'sonner';
import { productApi } from '@/api/warehouse.api';

import type {
  Product,
  ProductQuery,
  ProductResponse,
  CreateProductDto,
  UpdateProductDto,
} from '@/types/warehouse.type';

interface ProductState {
  products: Product[];
  meta?: ProductResponse['meta'];
  filters: ProductQuery;
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  setFilters: (filters: Partial<ProductQuery>) => void;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  meta: undefined,

  filters: {
    page: 1,
    limit: 10,
    search: '',
    categoryId: '',
    supplierId: '',
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
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        page: 1,
      },
    }));
    get().fetchProducts();
  },

  createProduct: async (data) => {
    try {
      await productApi.createProduct(data);
      toast.success('Thêm sản phẩm thành công');
      await get().fetchProducts();
    } catch {
      toast.error('Thêm sản phẩm thất bại');
    }
  },

  updateProduct: async (id, data) => {
    try {
      await productApi.updateProduct(id, data);
      toast.success('Cập nhật sản phẩm thành công');
      await get().fetchProducts();
    } catch {
      toast.error('Cập nhật sản phẩm thất bại');
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
}));