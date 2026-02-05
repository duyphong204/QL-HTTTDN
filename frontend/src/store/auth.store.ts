import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/user.type";
import { setAccessToken } from "@/services/api";

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

            // Only store access token (refresh token is in httpOnly cookie)
            setAccessToken(res.accessToken);

            set({
                accessToken: res.accessToken,
                user: res.user,
            });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (fullName, email, password) => {
        await authService.register({ fullName, email, password });
        // Auto-login after successful registration
        await useAuthStore.getState().login(email, password);
    },

    fetchProfile: async () => {
        const user = await authService.getProfile();
        set({ user });
    },

    logout: async () => {
        try {
            await authService.logout();
        } catch (error) {
            // Ignore logout errors, clear tokens anyway
            console.error("Logout error:", error);
        }

        // Clear access token (refresh token cookie cleared by backend)
        setAccessToken(null);
        set({ user: null, accessToken: null });
    },
}));
