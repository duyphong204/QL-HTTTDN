import { axiosInstance } from './api';
import type { Product, CreateProductDto, Supplier, Category, StockIn, CreateStockInDto } from '@/types/warehouse.type';

// ==================== PRODUCTS ====================
export const productService = {
    getAll: async (search?: string, categoryId?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('categoryId', categoryId);

        const response = await axiosInstance.get(`/products?${params.toString()}`);
        return response.data as Product[];
    },

    create: async (data: CreateProductDto) => {
        const response = await axiosInstance.post('/products', data);
        return response.data as Product;
    },

    update: async (id: string, data: Partial<CreateProductDto>) => {
        const response = await axiosInstance.patch(`/products/${id}`, data);
        return response.data as Product;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/products/${id}`);
        return response.data;
    },
};

// ==================== SUPPLIERS ====================
export const supplierService = {
    getAll: async () => {
        const response = await axiosInstance.get('/suppliers');
        return response.data as Supplier[];
    },

    create: async (data: Partial<Supplier>) => {
        const response = await axiosInstance.post('/suppliers', data);
        return response.data as Supplier;
    },

    update: async (id: string, data: Partial<Supplier>) => {
        const response = await axiosInstance.patch(`/suppliers/${id}`, data);
        return response.data as Supplier;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/suppliers/${id}`);
        return response.data;
    },
};

// ==================== CATEGORIES ====================
export const categoryService = {
    getAll: async () => {
        const response = await axiosInstance.get('/categories');
        return response.data as Category[];
    },

    create: async (data: { name: string }) => {
        const response = await axiosInstance.post('/categories', data);
        return response.data as Category;
    },
};

// ==================== STOCK IN ====================
export const stockInService = {
    getAll: async () => {
        const response = await axiosInstance.get('/stock-in');
        return response.data as StockIn[];
    },

    create: async (data: CreateStockInDto) => {
        const response = await axiosInstance.post('/stock-in', data);
        return response.data as StockIn;
    },
};
