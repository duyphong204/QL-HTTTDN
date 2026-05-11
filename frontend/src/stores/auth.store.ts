import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { setAccessToken } from "@/api/axios";
import { getErrorMessage } from "@/stores/store.helpers";
import type { User } from "@/types/user.types";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  handleregister: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(data);
      setAccessToken(res.accessToken);
      set({ user: res.user, isAuthenticated: true });
      toast.success("Đăng nhập thành công 🎉");
    } catch (error) {
      toast.error(getErrorMessage(error, "Lỗi đăng nhập"));
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  handleregister: async (data) => {
    try {
      await authService.register(data);
      toast.success("Đăng ký thành công 🎉");
    } catch (error) {
      toast.error(getErrorMessage(error, "Lỗi đăng ký"));
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await authService.getProfile();
      set({ user: profile, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { accessToken } = await authService.refresh();
      setAccessToken(accessToken);
      const profile = await authService.getProfile();
      set({ user: profile, isAuthenticated: true });
    } catch {
      setAccessToken(null);
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
      toast.error("Đăng xuất thất bại");
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
