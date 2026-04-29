import { LoginForm } from "@/components/forms/LoginForm"
import { useAuthStore } from "@/stores/auth.store"
import { Navigate } from "react-router-dom"

const getRedirectPathByRole = (role?: string) => {
    if (role === "CUSTOMER") return "/";
    return "/admin/dashboard";
};

export default function LoginPage() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.user?.role);

    if (isAuthenticated) {
        return <Navigate to={getRedirectPathByRole(role)} replace />;
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    )
}
