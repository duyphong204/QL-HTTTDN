import { create } from "zustand";
import { userService } from "@/services/user.service";
import {
  getErrorMessage,
  mergeFiltersWithPageReset,
} from "@/stores/store.helpers";
import { toast } from "sonner";
import type { Role } from "@/types/auth.types";
import type { User } from "@/types/user.types";
import type {
  BaseFilters,
  PaginationMeta,
  SortOrder,
} from "@/types/common.types";

type UserFilters = BaseFilters & {
  role?: Role;
  sortBy: "createdAt" | "email" | "role";
  sortOrder: SortOrder;
  isActive?: boolean;
};

// Định nghĩa kiểu dữ liệu cho form giống như trong hook cũ
type UserFormValues = {
  email: string;
  password?: string;
  role: Role;
  profile: {
    fullName: string;
  };
};

export type { UserFilters, UserFormValues };

type UserState = {
  users: User[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;

  // Actions
  setFilters: (filters: Partial<UserFilters>) => void;
  fetchUsers: () => Promise<void>;
  addUser: (data: UserFormValues) => Promise<void>;
  updateUser: (id: string, data: UserFormValues) => Promise<void>;
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
    get().fetchUsers(); // Tự động fetch lại khi filter thay đổi
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getUsers(get().filters);
      set({ users: response.data, meta: response.meta });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  addUser: async (data) => {
    try {
      await userService.createUser({
        email: data.email,
        password: data.password || "",
        role: "CUSTOMER",
        profile: { fullName: data.profile.fullName },
      });
      toast.success("Thêm người dùng thành công");
      await get().fetchUsers();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  },

  updateUser: async (id, data) => {
    try {
      await userService.updateUser(id, {
        email: data.email,
        role: "CUSTOMER",
        profile: { fullName: data.profile.fullName },
      });
      toast.success("Cập nhật người dùng thành công");
      await get().fetchUsers();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  },

  deleteUser: async (id) => {
    try {
      await userService.deleteUser(id);
      toast.success("Xóa người dùng thành công");
      await get().fetchUsers();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  },
}));
