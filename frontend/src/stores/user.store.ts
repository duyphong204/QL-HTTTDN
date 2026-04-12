import { create } from "zustand";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import type { Role } from "@/types/auth.type";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.type";
import type { BaseFilters, PaginationMeta, SortOrder } from "@/types/common.type";
import { getErrorMessage, loadingState, mergeFiltersWithPageReset } from "@/stores/store.helpers";

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
    fetchUsers: () => Promise<void>;
    addUser: (data: CreateUserDto) => Promise<void>;
    updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
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

    fetchUsers: async () => {
        set({ ...loadingState("isLoading", true), error: null });
        try {
            const { filters } = get();
            const response = await userService.getUsers(filters);
            set({
                users: response.data,
                meta: response.meta,
            });
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
        } finally {
            set(loadingState("isLoading", false));
        }
    },

    addUser: async (data) => {
        try {
            const newUser = await userService.createUser(data);
            set((state) => ({
                users: [newUser, ...state.users],
            }));

            toast.success("Thêm người dùng thành công");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
            throw err;
        }
    },

    updateUser: async (id, data) => {
        try {
            const updated = await userService.updateUser(id, data);
            set((state) => ({
                users: state.users.map((u) =>
                    u.id === id ? updated : u
                ),
            }));

            toast.success("Cập nhật người dùng thành công");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
            throw err;
        }
    },

    deleteUser: async (id) => {
        try {
            await userService.deleteUser(id);
            set((state) => ({
                users: state.users.filter((u) => u.id !== id),
            }));

            toast.success("Xóa người dùng thành công");
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message });
            toast.error(message);
            throw err;
        }
    },

}));
