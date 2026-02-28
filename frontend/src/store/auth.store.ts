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
const toErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : "Lỗi không xác định";

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, 

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authApi.login({ email, password });
            setAccessToken(res.accessToken);

            set({
                user: res.user,
                isAuthenticated: true,
                isLoading: false,
            });

            toast.success("Đăng nhập thành công 🎉");
        } catch (error: unknown) {
            const msg = toErrorMessage(error); 
            toast.error(msg);
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (fullName, email, password) => {
        try {
            await authApi.register({ fullName, email, password });
            toast.success("Đăng ký thành công 🎉");
            await get().login(email, password);
        } catch (error: unknown) {
            const msg = toErrorMessage(error);
            toast.error(msg);
            throw error;
        }
    },

    fetchProfile: async () => {
        try {
            const user = await authApi.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error: unknown) {
                const msg = toErrorMessage(error);
                toast.error(msg);
                set({ user: null, isAuthenticated: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const { accessToken } = await authApi.refresh();
            setAccessToken(accessToken);

            const user = await authApi.getProfile();

            set({
                user,
                isAuthenticated: true,
                isLoading : false                                                                                                                                         
            });
        } catch(error) {
            setAccessToken(null);
            set({
                user: null,
                isAuthenticated: false
            });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
            toast.success("Đã đăng xuất 👋");
        } catch (error: unknown) {
            toast.error("Đăng xuất thất bại");
        }

        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
    },
}));
