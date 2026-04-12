import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/user.type";
import type { LoginRequest, RegisterRequest } from "@/types/auth.type";
import { setAccessToken } from "@/api/axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/stores/store.helpers";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>; 
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, 

    login: async (data) => {
        set({ isLoading: true });
        try {
            const res = await authService.login(data);
            setAccessToken(res.accessToken);

            set({
                user: res.user,
                isAuthenticated: true,
                isLoading: false,
            });

            toast.success("Đăng nhập thành công 🎉");
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Lỗi không xác định"); 
            toast.error(msg);
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (data) => {
        try {
            await authService.register(data);
            toast.success("Đăng ký thành công 🎉");
            await get().login({ email: data.email, password: data.password });
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Lỗi không xác định");
            toast.error(msg);
            throw error;
        }
    },

    fetchProfile: async () => {
        try {
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Lỗi không xác định");
                toast.error(msg);
                set({ user: null, isAuthenticated: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const { accessToken } = await authService.refresh();
            setAccessToken(accessToken);

            const user = await authService.getProfile();

            set({
                user,
                isAuthenticated: true,
                isLoading : false                                                                                                                                         
            });
        } catch {
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
            await authService.logout();
            toast.success("Đã đăng xuất 👋");
        } catch {
            toast.error("Đăng xuất thất bại");
        }

        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
    },
}));
