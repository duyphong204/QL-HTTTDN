import { axiosInstance } from "./api";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.type";

export const userService = {
    getUsers: async () => {
        const res = await axiosInstance.get<User[]>("/users");
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
};
