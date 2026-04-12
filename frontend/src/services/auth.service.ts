import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/auth.type"
import type { User } from "@/types/user.type"
import { apiGet, apiPost } from "@/api/base"

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiPost<LoginResponse>("/auth/login", data);
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        return apiPost<RegisterResponse>("/auth/register", data);
    },

    refresh: async (): Promise<{ accessToken: string }> => {
        return apiPost<{ accessToken: string }>("/auth/refresh");
    },

    getProfile: async (): Promise<User> => {
        return apiGet<User>("/auth/profile");
    },

    logout: async (): Promise<void> => {
        await apiPost<void>("/auth/logout");
    },
};
