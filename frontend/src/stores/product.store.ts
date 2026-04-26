import { create } from 'zustand'
import { productService, categoryService, supplierService } from '@/services/warehouse.service'
import { getErrorMessage, mergeFiltersWithPageReset } from '@/stores/store.helpers'
import { toast } from 'sonner'
import type { Product, ProductResponse, CreateProductDto, UpdateProductDto } from '@/types/product.types'
import type { BaseFilters, SortOrder } from '@/types/common.types'
import type { Category } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'

type ProductFilters = BaseFilters & {
  categoryId?: string
  supplierId?: string
  sortBy: 'name' | 'price' | 'costPrice' | 'stockQuantity'
  sortOrder: SortOrder
}

interface ProductState {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
  meta?: ProductResponse['meta']
  filters: ProductFilters
  isLoading: boolean

  // Actions
  setFilters: (filters: Partial<ProductFilters>) => void
  fetchProducts: () => Promise<void>
  fetchDependencies: () => Promise<void>
  createProduct: (data: CreateProductDto) => Promise<void>
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  suppliers: [],
  meta: undefined,
  isLoading: false,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    categoryId: '',
    supplierId: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: mergeFiltersWithPageReset(state.filters, newFilters),
    }));
    get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await productService.getProducts(get().filters);
      set({ products: response.data, meta: response.meta });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách sản phẩm'));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDependencies: async () => {
    try {
      const [cats, sups] = await Promise.all([
        categoryService.getAll(),
        supplierService.getSuppliers()
      ]);
      set({ categories: cats, suppliers: sups.data });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải dữ liệu phụ trợ'));
    }
  },

  createProduct: async (data) => {
    try {
      await productService.createProduct(data);
      toast.success('Thêm sản phẩm thành công');
      await get().fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Thêm sản phẩm thất bại'));
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      await productService.updateProduct(id, data);
      toast.success('Cập nhật sản phẩm thành công');
      await get().fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cập nhật sản phẩm thất bại'));
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Xóa sản phẩm thành công');
      await get().fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Xóa sản phẩm thất bại'));
    }
  },
}))