import { create } from "zustand";
import { categoryService } from "@/services/warehouse.service";
import { getErrorMessage } from "@/stores/store.helpers";
import { toast } from "sonner";
import type { Category } from "@/types/product.types";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const data = await categoryService.getAll();
      set({ categories: data });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể tải danh mục"));
    } finally {
      set({ isLoading: false });
    }
  },

  createCategory: async (name: string) => {
    try {
      const newCategory = await categoryService.create(name);
      set({ categories: [...get().categories, newCategory] });
      toast.success("Thêm danh mục thành công");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  updateCategory: async (id: string, name: string) => {
    try {
      const updated = await categoryService.update(id, name);
      set({
        categories: get().categories.map((cat) => (cat.id === id ? updated : cat)),
      });
      toast.success("Cập nhật danh mục thành công");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await categoryService.delete(id);
      set({
        categories: get().categories.filter((cat) => cat.id !== id),
      });
      toast.success("Xóa danh mục thành công");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  },
}));