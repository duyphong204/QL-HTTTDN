import { apiGet, apiPost, apiPatch, apiDelete } from "./base";
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
  WarehouseReport,
} from "@/types/warehouse.type";
import type {
  BaseFilters,
  PaginatedResponse,
  SortOrder,
} from "@/types/common.type";

const toProductFormData = (data: CreateProductDto | UpdateProductDto) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "image" && value instanceof File) {
      formData.append("image", value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const categoryApi = {
  getCategories: async () => {
    return apiGet<Category[]>("/categories");
  },

  createCategory: async (data: { name: string }) => {
    return apiPost<Category>("/categories", data);
  },

  updateCategory: async (id: string, data: { name: string }) => {
    return apiPatch<Category>("/categories/" + id, data);
  },

  deleteCategory: async (id: string) => {
    await apiDelete("/categories/" + id);
  },
};

export const supplierApi = {
  getSuppliers: async (
    params?: Partial<BaseFilters> & {
      sortBy?: string;
      sortOrder?: SortOrder;
    },
  ) => {
    return apiGet<PaginatedResponse<Supplier>>("/suppliers", params);
  },

  getSupplierById: async (id: string) => {
    return apiGet<Supplier>("/suppliers/" + id);
  },

  createSupplier: async (data: CreateSupplierDto) => {
    return apiPost<Supplier>("/suppliers", data);
  },

  updateSupplier: async (id: string, data: UpdateSupplierDto) => {
    return apiPatch<Supplier>("/suppliers/" + id, data);
  },

  deleteSupplier: async (id: string) => {
    await apiDelete("/suppliers/" + id);
  },
};

export const productApi = {
  getProducts: async (params?: ProductQuery) => {
    return apiGet<ProductResponse>("/products", params);
  },

  getProductById: async (id: string) => {
    return apiGet<Product>("/products/" + id);
  },

  createProduct: async (data: CreateProductDto) => {
    const formData = toProductFormData(data);
    return apiPost<Product>("/products", formData);
  },

  updateProduct: async (id: string, data: UpdateProductDto) => {
    const formData = toProductFormData(data);
    return apiPatch<Product>("/products/" + id, formData);
  },

  deleteProduct: async (id: string) => {
    await apiDelete("/products/" + id);
  },
  getReport: async (params?: { month?: number; year?: number }) => {
    return apiGet<WarehouseReport>("/products/report/stats", params);
  },
};

export const stockInApi = {
  getStockIns: async () => {
    return apiGet<StockIn[]>("/stock-ins");
  },

  createStockIn: async (data: CreateStockInDto) => {
    return apiPost<StockIn>("/stock-ins", data);
  },

  getStockInById: async (id: string) => {
    return apiGet<StockIn>("/stock-ins/" + id);
  },
};
