import { create } from "zustand";
import type { Role } from "@/types/auth.types";
import type { User  } from "@/types/user.types";
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.types";
import { mergeFiltersWithPageReset } from "@/stores/store.helpers";

type UserFilters = BaseFilters & {
    role?: Role;
    sortBy: "createdAt" | "email" | "role";
    sortOrder: SortOrder;
    isActive?: boolean;
};

export type { UserFilters };

type UserState = {
    users: User[];
    meta: PaginationMeta | null;
    isLoading: boolean;
    error: string | null;
    filters: UserFilters;

    setFilters: (filters: Partial<UserFilters>) => void;
    setUsers: (users: User[]) => void;
    setMeta: (meta: PaginationMeta | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
    users: [],
    meta: null,
    isLoading: false,
    error: null,
    filters: {
        page: 1,
        limit: 10,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: mergeFiltersWithPageReset(state.filters, newFilters),
        }));
    },

    setUsers: (users) => set({ users }),
    setMeta: (meta) => set({ meta }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

}));
