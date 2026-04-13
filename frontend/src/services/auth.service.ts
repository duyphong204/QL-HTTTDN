import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/auth.types"
import type { User } from "@/types/user.types"
import { apiGet, apiPost } from "@/api/client"
import { endpoints } from "@/api/endpoints"

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiPost<LoginResponse>(endpoints.auth.login, data);
    },

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        return apiPost<RegisterResponse>(endpoints.auth.register, data);
    },

    refresh: async (): Promise<{ accessToken: string }> => {
        return apiPost<{ accessToken: string }>(endpoints.auth.refresh);
    },

    getProfile: async (): Promise<User> => {
        return apiGet<User>(endpoints.auth.profile);
    },

    logout: async (): Promise<void> => {
        await apiPost<void>(endpoints.auth.logout);
    },
};
