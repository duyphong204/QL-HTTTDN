import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { PATHS } from "@/routes";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { accessToken } = useAuthStore();

    if (!accessToken) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    return children;
};

export default ProtectedRoute;
