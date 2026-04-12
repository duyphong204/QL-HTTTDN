import { create } from "zustand";
import { toast } from "sonner";
import { categoryService } from "@/services/warehouse.service";
import type { Category } from "@/types/category.type";
import { getErrorMessage } from "@/stores/store.helpers";

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    fetchCategories: () => Promise<void>;
    createCategory: (name: string) => Promise<void>;
    updateCategory: (id: string, name: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await categoryService.getAll();
            set({ categories: data });
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    createCategory: async (name) => {
        try {
            const newCategory = await categoryService.create(name);
            set((state) => ({
                categories: [...state.categories, newCategory],
            }));
            toast.success("Thêm danh mục thành công");
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
            throw error;
        }
    },

    updateCategory: async (id, name) => {
        try {
            const updated = await categoryService.update(id, name);
            set((state) => ({
                categories: state.categories.map((cat) =>
                    cat.id === id ? updated : cat
                ),
            }));
            toast.success("Cập nhật danh mục thành công");
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            await categoryService.delete(id);
            set((state) => ({
                categories: state.categories.filter((cat) => cat.id !== id),
            }));
            toast.success("Xóa danh mục thành công");
        } catch (error: unknown) {
            const message = getErrorMessage(error);
            set({ error: message });
            toast.error(message);
        }
    },
}));
