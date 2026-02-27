import { create } from "zustand";
import { authApi } from "@/api/auth.api";
import type { User } from "@/types/user.type";
import { setAccessToken } from "@/api/axios";
import { toast } from "sonner";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>; 
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as true to wait for checkAuth

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login({ email, password });
            setAccessToken(res.accessToken);

            set({
                user: res.user,
                isAuthenticated: true,
            });

            toast.success("Đăng nhập thành công 🎉");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Đăng nhập thất bại"
            );
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (fullName, email, password) => {
        try {
            await authApi.register({ fullName, email, password });
            toast.success("Đăng ký thành công 🎉");
            await get().login(email, password);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Đăng ký thất bại"
            );
            throw error;
        }
    },

    fetchProfile: async () => {
        try {
            const user = await authApi.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error: any) {
            set({ user: null, isAuthenticated: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const user = await authApi.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
            toast.success("Đã đăng xuất 👋");
        } catch (error: any) {
            toast.error("Đăng xuất thất bại");
        }

        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
    },
}));
