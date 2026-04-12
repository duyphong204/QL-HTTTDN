import type { Role } from "@/types/auth.type";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

const ProtectedRoute = ({
    children,
    roles,
}: {
    children: React.ReactNode;
    roles?: Role[];
}) => {
    const { isAuthenticated, isLoading, user } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

    return <>{children}</>;
};

export default ProtectedRoute;
