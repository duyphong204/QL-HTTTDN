import { apiGet, apiPost, apiPatch, apiDelete, toFormData } from '@/api/client';
import type {
  Product,
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  StockIn,
  CreateProductDto,
  UpdateProductDto,
  CreateStockInDto,
  UpdateStockInDto,
  ProductQuery,
  ProductResponse,
  WarehouseReport,
} from '@/types/warehouse.type';
import type { Category } from '@/types/category.type';
import type { BaseFilters, PaginatedResponse, SortOrder } from '@/types/common.type';

const toProductFormData = (data: CreateProductDto | UpdateProductDto) => {
  return toFormData(data as Record<string, unknown>);
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    return apiGet<Category[]>('/categories');
  },

  create: async (name: string): Promise<Category> => {
    return apiPost<Category>('/categories', { name });
  },

  update: async (id: string, name: string): Promise<Category> => {
    return apiPatch<Category>(`/categories/${id}`, { name });
  },

  delete: async (id: string): Promise<void> => {
    await apiDelete(`/categories/${id}`);
  }
};

export const supplierService = {
  getSuppliers: async (params?: Partial<BaseFilters> & {
    sortBy?: string;
    sortOrder?: SortOrder;
  }): Promise<PaginatedResponse<Supplier>> => {
    return apiGet<PaginatedResponse<Supplier>>('/suppliers', params);
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    return apiGet<Supplier>(`/suppliers/${id}`);
  },

  createSupplier: async (data: CreateSupplierDto): Promise<Supplier> => {
    return apiPost<Supplier>('/suppliers', data);
  },

  updateSupplier: async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
    return apiPatch<Supplier>(`/suppliers/${id}`, data);
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiDelete(`/suppliers/${id}`);
  },
};

export const productService = {
  getProducts: async (params?: ProductQuery): Promise<ProductResponse> => {
    return apiGet<ProductResponse>('/products', params);
  },

  getProductById: async (id: string): Promise<Product> => {
    return apiGet<Product>(`/products/${id}`);
  },

  createProduct: async (data: CreateProductDto): Promise<Product> => {
    const formData = toProductFormData(data);
    return apiPost<Product>('/products', formData);
  },

  updateProduct: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const formData = toProductFormData(data);
    return apiPatch<Product>(`/products/${id}`, formData);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiDelete(`/products/${id}`);
  },
};

export const stockInService = {
  getStockIns: async (params?: { productId?: string; startDate?: string; endDate?: string }): Promise<StockIn[]> => {
    return apiGet<StockIn[]>('/stock-ins', params);
  },

  getStockInById: async (id: string): Promise<StockIn> => {
    return apiGet<StockIn>(`/stock-ins/${id}`);
  },

  createStockIn: async (data: CreateStockInDto): Promise<StockIn> => {
    return apiPost<StockIn>('/stock-ins', data);
  },

  updateStockIn: async (id: string, data: UpdateStockInDto): Promise<StockIn> => {
    return apiPatch<StockIn>(`/stock-ins/${id}`, data);
  },

  deleteStockIn: async (id: string): Promise<void> => {
    await apiDelete(`/stock-ins/${id}`);
  },
};

export const warehouseReportService = {
  getReport: async (params?: { month?: number; year?: number }): Promise<WarehouseReport> => {
    return apiGet<WarehouseReport>('/warehouse/report', params);
  },
};
