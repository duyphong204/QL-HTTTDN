import { apiDelete, apiGet, apiPatch, apiPost } from "./base";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.type";
import type { Role } from "@/types/auth.type";
import type { BaseFilters, PaginatedResponse, SortOrder } from "@/types/common.type";

export interface GetUsersParams extends Partial<BaseFilters> {
  role?: Role;
  sortBy?: "createdAt" | "email" | "role";
  sortOrder?: SortOrder;
  isActive?: boolean;
}

export const userApi = {
  getUsers: async (params?: GetUsersParams) => {
  return apiGet<PaginatedResponse<User>>("/users", params);
  },

  getUserById: async (id: string) => {
  return apiGet<User>(`/users/${id}`);
  },

  createUser: async (data: CreateUserDto) => {
  return apiPost<User>("/users", data);
  },

  updateUser: async (id: string, data: UpdateUserDto) => {
  return apiPatch<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
  await apiDelete(`/users/${id}`);
  },

  changeRole: async (id: string, role: string) => {
  return apiPatch<User>(`/users/${id}/role`, { role });
  },
};