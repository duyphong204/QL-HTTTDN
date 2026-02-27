import { create } from "zustand";
import { supplierApi } from "@/api/warehouse.api";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/warehouse.type";
import { toast } from "sonner";

interface SupplierState {
    suppliers: Supplier[];
    isLoading: boolean;
    error: string | null;
    filters: {
        page: number;
        limit: number;
        search: string;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    actions: {
        setFilters: (filters: Partial<SupplierState["filters"]>) => void;
        fetchSuppliers: () => Promise<void>;
        addSupplier: (data: CreateSupplierDto) => Promise<void>;
        updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<void>;
        deleteSupplier: (id: string) => Promise<void>;
    };
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
    suppliers: [],
    isLoading: false,
    error: null,
    filters: {
        page: 1,
        limit: 10,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    },
    actions: {
        setFilters: (newFilters) => {
            set((state) => ({
                filters: { ...state.filters, ...newFilters },
            }));
            get().actions.fetchSuppliers();
        },

        fetchSuppliers: async () => {
            const { filters } = get();
            set({ isLoading: true, error: null });
            try {
                const response = await supplierApi.getSuppliers({
                    page: filters.page,
                    limit: filters.limit,
                    search: filters.search,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder
                });
                const suppliers = Array.isArray(response) ? response : response.data || [];
                set({ suppliers, isLoading: false });
            } catch (error: any) {
                console.error("Error fetching suppliers:", error);
                // Mock data fallback
                set({
                    suppliers: [
                        { id: '1', name: 'Samsung Electronics Vietnam', contactPerson: 'Nguyễn Văn A', email: 'contact@samsung.vn', phone: '0281234567', address: 'KCN Tân Thuận, Q.7, TP.HCM', createdAt: '2023-01-01' },
                        { id: '2', name: 'Apple Vietnam', contactPerson: 'Trần Thị B', email: 'info@apple.vn', phone: '0282345678', address: 'Keangnam Landmark, Hà Nội', createdAt: '2023-02-15' },
                        { id: '3', name: 'Xiaomi Vietnam', contactPerson: 'Lê Văn C', email: 'support@xiaomi.vn', phone: '0283456789', address: 'Vinhomes Central Park, TP.HCM', createdAt: '2023-03-20' },
                        { id: '4', name: 'Sony Vietnam', contactPerson: 'Phạm Thị D', email: 'sales@sony.vn', phone: '0284567890', address: '123 Nguyễn Văn Linh, Q.7, TP.HCM', createdAt: '2023-04-10' },
                    ],
                    isLoading: false
                })
            }
        },

        addSupplier: async (data) => {
            set({ isLoading: true, error: null });
            try {
                await supplierApi.createSupplier(data);
                toast.success("Thêm nhà cung cấp thành công");
                get().actions.fetchSuppliers();
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                toast.error("Thêm nhà cung cấp thất bại: " + error.message);
                throw error;
            }
        },

        updateSupplier: async (id, data) => {
            set({ isLoading: true, error: null });
            try {
                await supplierApi.updateSupplier(id, data);
                toast.success("Cập nhật nhà cung cấp thành công");
                get().actions.fetchSuppliers();
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                toast.error("Cập nhật nhà cung cấp thất bại: " + error.message);
                throw error;
            }
        },

        deleteSupplier: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await supplierApi.deleteSupplier(id);
                toast.success("Xóa nhà cung cấp thành công");
                set((state) => ({
                    suppliers: state.suppliers.filter((s) => s.id !== id),
                    isLoading: false,
                }));
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                toast.error("Xóa nhà cung cấp thất bại: " + error.message);
            }
        },
    },
}));
