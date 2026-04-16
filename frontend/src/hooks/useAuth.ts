import { useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { setAccessToken } from "@/api/axios";
import { getErrorMessage } from "@/stores/store.helpers";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";

export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        setUser,
        setAuthenticated,
        setLoading,
    } = useAuthStore();

    const handleLogin = useCallback(
        async (data: LoginRequest) => {
            setLoading(true);
            try {
                const res = await authService.login(data);
                setAccessToken(res.accessToken);
                setUser(res.user);
                setAuthenticated(true);
                toast.success("Đăng nhập thành công 🎉");
            } catch (error: unknown) {
                toast.error(getErrorMessage(error, "Lỗi không xác định"));
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [setAuthenticated, setLoading, setUser],
    );

    const handleRegister = useCallback(
        async (data: RegisterRequest) => {
            try {
                await authService.register(data);
                toast.success("Đăng ký thành công 🎉");
            } catch (error: unknown) {
                toast.error(getErrorMessage(error, "Lỗi không xác định"));
                throw error;
            }
        },
        [],
    );

    const handleFetchProfile = useCallback(async () => {
        try {
            const profile = await authService.getProfile();
            setUser(profile);
            setAuthenticated(true);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Lỗi không xác định"));
            setUser(null);
            setAuthenticated(false);
        }
    }, [setAuthenticated, setUser]);

    const handleCheckAuth = useCallback(async () => {
        setLoading(true);
        try {
            const { accessToken } = await authService.refresh();
            setAccessToken(accessToken);
            const profile = await authService.getProfile();
            setUser(profile);
            setAuthenticated(true);
        } catch {
            setAccessToken(null);
            setUser(null);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, [setAuthenticated, setLoading, setUser]);

    const handleLogout = useCallback(async () => {
        try {
            await authService.logout();
            toast.success("Đã đăng xuất 👋");
        } catch {
            toast.error("Đăng xuất thất bại");
        }
        setAccessToken(null);
        setUser(null);
        setAuthenticated(false);
    }, [setAuthenticated, setUser]);

    return {
        user,
        isAuthenticated,
        isLoading,
        handleLogin,
        handleRegister,
        handleLogout,
        handleCheckAuth,
        handleFetchProfile,
    };
};
