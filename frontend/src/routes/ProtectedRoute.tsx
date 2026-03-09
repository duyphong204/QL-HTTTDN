import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { PATHS } from "@/routes";

const ProtectedRoute = ({ children,allowedRoles  }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user?.role)) {
        return <Navigate to={"/"} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
