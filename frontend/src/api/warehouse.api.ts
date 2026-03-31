import { axiosInstance } from './axios';
import type {
  Product,
  Category,
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  StockIn,
  CreateProductDto,
  UpdateProductDto,
  CreateStockInDto,
  ProductQuery,
  ProductResponse,
} from '@/types/warehouse.type';
import type { BaseFilters, PaginatedResponse, SortOrder } from '@/types/common.type';

const toProductFormData = (data: CreateProductDto | UpdateProductDto) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === 'image' && value instanceof File) {
      formData.append('image', value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const categoryApi = {
  getCategories: async () => {
    const res = await axiosInstance.get<Category[]>('/categories');
    return res.data;
  },

  createCategory: async (data: { name: string }) => {
    const res = await axiosInstance.post<Category>('/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: { name: string }) => {
    const res = await axiosInstance.patch<Category>('/categories/' + id, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    await axiosInstance.delete('/categories/' + id);
  },
};

export const supplierApi = {
  getSuppliers: async (params?: Partial<BaseFilters> & {
    sortBy?: string;
    sortOrder?: SortOrder;
  }) => {
    const res = await axiosInstance.get<PaginatedResponse<Supplier>>('/suppliers', { params });
    return res.data;
  },

  getSupplierById: async (id: string) => {
    const res = await axiosInstance.get<Supplier>('/suppliers/' + id);
    return res.data;
  },

  createSupplier: async (data: CreateSupplierDto) => {
    const res = await axiosInstance.post<Supplier>('/suppliers', data);
    return res.data;
  },

  updateSupplier: async (id: string, data: UpdateSupplierDto) => {
    const res = await axiosInstance.patch<Supplier>('/suppliers/' + id, data);
    return res.data;
  },

  deleteSupplier: async (id: string) => {
    await axiosInstance.delete('/suppliers/' + id);
  },
};

export const productApi = {
  getProducts: async (params?: ProductQuery) => {
    const res = await axiosInstance.get<ProductResponse>('/products', { params });
    return res.data;
  },

  getProductById: async (id: string) => {
    const res = await axiosInstance.get<Product>('/products/' + id);
    return res.data;
  },

  createProduct: async (data: CreateProductDto) => {
    const formData = toProductFormData(data);
    const res = await axiosInstance.post<Product>('/products', formData);
    return res.data;
  },

  updateProduct: async (id: string, data: UpdateProductDto) => {
    const formData = toProductFormData(data);
    const res = await axiosInstance.patch<Product>('/products/' + id, formData);
    return res.data;
  },

  deleteProduct: async (id: string) => {
    await axiosInstance.delete('/products/' + id);
  },
  getReport: async (params?: { month?: number; year?: number }) => {
    const res = await axiosInstance.get('/products/report/stats', { params });
    return res.data;
  },
};

export const stockInApi = {
  getStockIns: async () => {
    const res = await axiosInstance.get<StockIn[]>('/stock-ins');
    return res.data;
  },

  createStockIn: async (data: CreateStockInDto) => {
    const res = await axiosInstance.post<StockIn>('/stock-ins', data);
    return res.data;
  },

  getStockInById: async (id: string) => {
    const res = await axiosInstance.get<StockIn>('/stock-ins/' + id);
    return res.data;
  },
};