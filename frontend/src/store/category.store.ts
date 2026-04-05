import { create } from "zustand";
import { categoryApi } from "@/api/warehouse.api";
import type { Category } from "@/types/warehouse.type";
import { toast } from "sonner";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string }) => Promise<void>;
  updateCategory: (id: string, data: { name: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      const data = await categoryApi.getCategories();
      set({ categories: data });
    } catch (error) {
      toast.error("Không thể lấy danh sách danh mục");
      set({ categories: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  createCategory: async (data: { name: string }) => {
    try {
      const newCategory = await categoryApi.createCategory(data);
      set((state) => ({ categories: [...state.categories, newCategory] }));
      toast.success("Thêm danh mục thành công");
    } catch (error) {
      toast.error("Không thể thêm danh mục");
    }
  },
  updateCategory: async (id: string, data: { name: string }) => {
    try {
      const updatedCategory = await categoryApi.updateCategory(id, data);
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? updatedCategory : cat,
        ),
      }));
      toast.success("Cập nhật danh mục thành công");
    } catch (error) {
      toast.error("Không thể cập nhật danh mục");
    }
  },
  deleteCategory: async (id: string) => {
    try {
      await categoryApi.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));
      toast.success("Xóa danh mục thành công");
    } catch (error) {
      toast.error("Không thể xóa danh mục");
    }
  },
}));
