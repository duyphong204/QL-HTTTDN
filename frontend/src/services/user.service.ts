import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.types";
import type { BaseFilters, PaginatedResponse, SortOrder } from "@/types/common.types";

export interface GetUsersParams extends Partial<BaseFilters> {
  sortBy?: "createdAt" | "email";
  sortOrder?: SortOrder;
  isActive?: boolean;
}

export const userService = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    return apiGet<PaginatedResponse<User>>(endpoints.users.root, params);
  },

  getUserById: async (id: string): Promise<User> => {
    return apiGet<User>(endpoints.users.byId(id));
  },

  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiPost<User>(endpoints.users.root, data);
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiPatch<User>(endpoints.users.byId(id), data);
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiDelete(endpoints.users.byId(id));
  },
};
