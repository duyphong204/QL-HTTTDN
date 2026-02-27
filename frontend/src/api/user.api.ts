import { axiosInstance } from "./axios"
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.type"
import type  { Role } from "@/types/auth.type"

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
}
export const userApi = {
    getUsers: async (params?: GetUsersParams) => {
        const res = await axiosInstance.get<User[]>("/users", { params });
        return res.data;
    },

    getUserById: async (id: string) => {
        const res = await axiosInstance.get<User>(`/users/${id}`);
        return res.data;
    },

    createUser: async (data: CreateUserDto) => {
        const res = await axiosInstance.post<User>("/users", data);
        return res.data;
    },

    updateUser: async (id: string, data: UpdateUserDto) => {
        const res = await axiosInstance.patch<User>(`/users/${id}`, data);
        return res.data;
    },

    deleteUser: async (id: string) => {
        await axiosInstance.delete(`/users/${id}`);
    },

    changeRole: async (id: string, role: string) => {
        const res = await axiosInstance.patch<User>(`/users/${id}/role`, { role });
        return res.data;
    },
};