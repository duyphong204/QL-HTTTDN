import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/user.type";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authService.login({ email, password });

            localStorage.setItem("accessToken", res.accessToken);

            set({
                accessToken: res.accessToken,
                user: res.user,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (fullName, email, password) => {
        const res = await authService.register({ fullName, email, password });

        localStorage.setItem("accessToken", res.accessToken);
        set({ accessToken: res.accessToken, user: res.user });
    },

    fetchProfile: async () => {
        const user = await authService.getProfile();
        set({ user });
    },

    logout: async () => {
        await authService.logout();
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null });
    },
}));
