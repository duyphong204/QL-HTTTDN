import { create } from "zustand";
import { categoryApi } from "@/api/warehouse.api";
import type { Category } from "@/types/warehouse.type";
import { toast } from "sonner";
import type { PaginationMeta } from "@/types/common.type";

// Helper function to remove diacritics for Vietnamese search
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

interface CategoryFilters {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface CategoryState {
  categories: Category[];
  meta: PaginationMeta;
  isLoading: boolean;
  filters: CategoryFilters;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: Partial<CategoryFilters>) => void;
  createCategory: (data: { name: string }) => Promise<void>;
  updateCategory: (id: string, data: { name: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  filters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "name",
    sortOrder: "asc",
  },
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      const { filters } = get();
      const data = await categoryApi.getCategories();

      // Client-side filtering and sorting (since API likely returns all)
      let filtered = data;

      if (filters.search) {
        const normalizedSearch = normalizeString(filters.search);
        filtered = filtered.filter((cat) =>
          normalizeString(cat.name).includes(normalizedSearch),
        );
      }

      // Sort
      filtered.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        const comparison = nameA.localeCompare(nameB);
        return filters.sortOrder === "desc" ? -comparison : comparison;
      });

      // Pagination
      const total = filtered.length;
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit;
      const paginatedCategories = filtered.slice(start, end);

      set({
        categories: paginatedCategories,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      });
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
      // Refetch to update pagination
      await get().fetchCategories();
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
      // Refetch to maintain correct sorting/filtering
      await get().fetchCategories();
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
      // Refetch to update pagination
      await get().fetchCategories();
    } catch (error) {
      toast.error("Không thể xóa danh mục");
    }
  },
}));
