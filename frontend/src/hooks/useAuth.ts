import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";

export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        fetchProfile,
        logout,
        checkAuth,
    } = useAuthStore();

    const handleLogin = async (data: LoginRequest) => {
        await login(data);
    };

    const handleRegister = async (data: RegisterRequest) => {
        await register(data);
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleCheckAuth = async () => {
        await checkAuth();
    };

    const handleFetchProfile = async () => {
        await fetchProfile();
    };

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
