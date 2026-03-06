import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={'/login'} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
