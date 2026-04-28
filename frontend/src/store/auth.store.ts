import { create } from "zustand";
import { authApi } from "@/api/auth.api";
import type { User } from "@/types/user.type";
import type { LoginRequest, RegisterRequest } from "@/types/auth.type";
import { setAccessToken } from "@/api/axios";
import { toast } from "sonner";
import { useCartStore } from "./cart.store";

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

let checkAuthInFlight: Promise<void> | null = null;

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Lỗi không xác định";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // 🔥 LOGIN
  login: async (data) => {
    set({ isLoading: true });

    try {
      const res = await authApi.login(data);
      setAccessToken(res.accessToken);

      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // ✅ xử lý cart SAU khi có user
      const cart = useCartStore.getState();
      await cart.mergeGuestToUser(res.user.id);

      toast.success("Đăng nhập thành công 🎉");
    } catch (error: unknown) {
      const msg = toErrorMessage(error);
      toast.error(msg);
      set({ isLoading: false });
      throw error;
    }
  },

  // 🔥 REGISTER
  register: async (data) => {
    try {
      await authApi.register(data);
      toast.success("Đăng ký thành công 🎉");

      await get().login({
        email: data.email,
        password: data.password,
      });
    } catch (error: unknown) {
      const msg = toErrorMessage(error);
      toast.error(msg);
      throw error;
    }
  },

  // 🔥 FETCH PROFILE
  fetchProfile: async () => {
    try {
      const user = await authApi.getProfile();

      set({ user, isAuthenticated: true });

      // load cart theo user
      const cart = useCartStore.getState();
      await cart.setOwner(user.id);
    } catch (error: unknown) {
      set({ user: null, isAuthenticated: false });
    }
  },

  // 🔥 CHECK AUTH (quan trọng nhất khi reload)
  checkAuth: async () => {
    if (checkAuthInFlight) {
      return checkAuthInFlight;
    }

    set({ isLoading: true });

    const request = (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);

        const user = await authApi.getProfile();

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // ✅ load cart theo user
        const cart = useCartStore.getState();
        await cart.setOwner(user.id);
      } catch {
        setAccessToken(null);

        set({
          user: null,
          isAuthenticated: false,
        });

        // 👉 fallback về guest
        const cart = useCartStore.getState();
        await cart.setOwner("guest");
      } finally {
        set({ isLoading: false });
        checkAuthInFlight = null;
      }
    })();

    checkAuthInFlight = request;
    return request;
  },

  // 🔥 LOGOUT
  logout: async () => {
    try {
      await authApi.logout();
      toast.success("Đã đăng xuất 👋");
    } catch {
      toast.error("Đăng xuất thất bại");
    }

    setAccessToken(null);
    set({ user: null, isAuthenticated: false });

    // ✅ chuyển về guest cart
    const cart = useCartStore.getState();
    await cart.setOwner("guest");
  },
}));
