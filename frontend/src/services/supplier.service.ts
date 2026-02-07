import type { CreateSupplierDto, Supplier, UpdateSupplierDto } from "@/types/supplier.type";
import { axiosInstance } from "./api";


export const supplierService = {
    getSuppliers: async (params?: any) => {
        // Mock data for initial development if API is not ready
        // return Promise.resolve({
        //   data: [
        //     { id: '1', name: 'Samsung Electronics Vietnam', contactPerson: 'Nguyễn Văn A', email: 'contact@samsung.vn', phone: '0281234567', address: 'KCN Tân Thuận, Q.7, TP.HCM', createdAt: '2023-01-01' },
        //     { id: '2', name: 'Apple Vietnam', contactPerson: 'Trần Thị B', email: 'info@apple.vn', phone: '0282345678', address: 'Keangnam Landmark, Hà Nội', createdAt: '2023-02-15' },
        //   ],
        //   total: 2
        // });
        const response = await axiosInstance.get<{ data: Supplier[], total: number }>("/suppliers", { params });
        return response.data;
    },

    getSupplierById: async (id: string) => {
        const response = await axiosInstance.get<Supplier>(`/suppliers/${id}`);
        return response.data;
    },

    createSupplier: async (data: CreateSupplierDto) => {
        const response = await axiosInstance.post<Supplier>("/suppliers", data);
        return response.data;
    },

    updateSupplier: async (id: string, data: UpdateSupplierDto) => {
        const response = await axiosInstance.patch<Supplier>(`/suppliers/${id}`, data);
        return response.data;
    },

    deleteSupplier: async (id: string) => {
        const response = await axiosInstance.delete(`/suppliers/${id}`);
        return response.data;
    },
};
