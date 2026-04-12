import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/base";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.type";
import type { Role } from "@/types/auth.type";
import type { BaseFilters, PaginatedResponse, SortOrder } from "@/types/common.type";

export interface GetUsersParams extends Partial<BaseFilters> {
  role?: Role;
  sortBy?: "createdAt" | "email" | "role";
  sortOrder?: SortOrder;
  isActive?: boolean;
}

export const userService = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    return apiGet<PaginatedResponse<User>>("/users", params);
  },

  getUserById: async (id: string): Promise<User> => {
    return apiGet<User>(`/users/${id}`);
  },

  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiPost<User>("/users", data);
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiPatch<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiDelete(`/users/${id}`);
  },

  changeRole: async (id: string, role: string): Promise<User> => {
    return apiPatch<User>(`/users/${id}/role`, { role });
  },
};
