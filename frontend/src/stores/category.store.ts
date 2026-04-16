import { create } from "zustand";
import type { Category } from "@/types/product.types";

interface CategoryState {
    categories: Category[];
    isLoading: boolean;

    setCategories: (categories: Category[]) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    isLoading: false,

    setCategories: (categories) => set({ categories }),
    setLoading: (isLoading) => set({ isLoading }),
}));
