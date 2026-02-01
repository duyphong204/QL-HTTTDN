import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "@/types/auth.type";
import { axiosInstance } from "./api";
import type { User } from "@/types/user.type";

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await axiosInstance.post("/auth/login", data);
        return res.data;
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const res = await axiosInstance.post("/auth/register", data);
        return res.data;
    },

    getProfile: async (): Promise<User> => {
        const res = await axiosInstance.get("/auth/profile");
        return res.data;
    },

    logout: async (): Promise<void> => {
        await axiosInstance.post("/auth/logout");
    },
};
