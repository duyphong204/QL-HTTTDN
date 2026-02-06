import { create } from "zustand";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/user.type";
import { setAccessToken } from "@/services/api";
import { toast } from "sonner";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    fetchProfile: () => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>; // New action to restore session
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start as true to wait for checkAuth

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const res = await authService.login({ email, password });
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
            await authService.register({ fullName, email, password });
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
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error: any) {
            // If fetch profile fails, it might mean token expired and refresh failed
            set({ user: null, isAuthenticated: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            // Chiến thuật: Gọi fetchProfile.
            // Vì api.ts đã có interceptor, nếu chưa có token nó sẽ gửi request không token -> 401
            // Interceptor sẽ catch 401 -> gọi /refresh -> lấy token mới -> retry fetchProfile
            // Nếu refresh thành công -> fetchProfile thành công -> set user
            // Nếu refresh thất bại -> fetchProfile throw error -> catch -> set isAuthenticated = false
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await authService.logout();
            toast.success("Đã đăng xuất 👋");
        } catch {
            // Ignore error
        }

        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
    },
}));
