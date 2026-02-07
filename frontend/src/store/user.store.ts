import { create } from "zustand";
import { userService } from "../services/user.service";
import type { CreateUserDto, UpdateUserDto, User } from "@/types/user.type";
import { toast } from "sonner";

interface UserState {
    users: User[];
    isLoading: boolean;
    error: string | null;
    filters: {
        page: number;
        limit: number;
        search: string;
    };
    actions: {
        setFilters: (filters: Partial<UserState["filters"]>) => void;
        fetchUsers: () => Promise<void>;
        addUser: (data: CreateUserDto) => Promise<void>;
        updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
        deleteUser: (id: string) => Promise<void>;
    };
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,
    filters: {
        page: 1,
        limit: 10,
        search: "",
    },
    actions: {
        setFilters: (newFilters) => {
            set((state) => ({
                filters: { ...state.filters, ...newFilters },
            }));
            get().actions.fetchUsers();
        },

        fetchUsers: async () => {
            set({ isLoading: true, error: null });
            try {
                const users = await userService.getUsers();
                set({ users, isLoading: false });
            } catch (err: any) {
                set({
                    error: "Không tải được danh sách user",
                    isLoading: false,
                });
                toast.error("Không tải được danh sách người dùng");
            }
        },


        addUser: async (data) => {
            set({ isLoading: true, error: null });
            try {
                await userService.createUser(data);
                toast.success("Thêm người dùng thành công");
                get().actions.fetchUsers();
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                toast.error("Thêm người dùng thất bại: " + error.message);
                throw error;
            }
        },

        updateUser: async (id, data) => {
            set({ isLoading: true, error: null });
            try {
                await userService.updateUser(id, data);
                toast.success("Cập nhật người dùng thành công");
                get().actions.fetchUsers();
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                toast.error("Cập nhật người dùng thất bại: " + error.message);
                throw error;
            }
        },

        deleteUser: async (id) => {
            set({ isLoading: true, error: null });
            try {
                await userService.deleteUser(id);
                toast.success("Xóa người dùng thành công");
                set((state) => ({
                    users: state.users.filter((u) => u.id !== id),
                    isLoading: false,
                }));
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                toast.error("Xóa người dùng thất bại: " + error.message);
            }
        },
    },
}));
