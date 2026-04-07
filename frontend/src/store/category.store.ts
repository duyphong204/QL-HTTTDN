import { create } from 'zustand';
import { categoryApi } from '@/api/warehouse.api';
import type { Category } from '@/types/category.type';
import { toast } from 'sonner';

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
    addCategory: (data: { name: string }) => Promise<void>;
    updateCategory: (id: string, data: { name: string }) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,

    fetchCategories: async () => {
        set({ isLoading: true });
        try {
            const data = await categoryApi.getAll();
            set({ categories: data });
        } finally {
            set({ isLoading: false });
        }
    },

    addCategory: async (data) => {
        try {
            await categoryApi.create(data.name);
            toast.success('Thêm danh mục thành công');
            get().fetchCategories(); // Refresh lại danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi thêm');
        }
    },

    updateCategory: async (id, data) => {
        try {
            await categoryApi.update(id, data.name);
            toast.success('Cập nhật thành công');
            get().fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi sửa');
        }
    },

    deleteCategory: async (id) => {
        try {
            await categoryApi.delete(id);
            toast.success('Xóa thành công');
            set((state) => ({
                categories: state.categories.filter(c => c.id !== id)
            }));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xóa');
        }
    }
}));