import { LoginForm } from "./components/login-form"
import { useAuthStore } from "@/store/auth.store"
import { Navigate } from "react-router-dom"

export default function LoginPage() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (isAuthenticated) return <Navigate to="/" replace />;

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0 bg-gradient-purple">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    )
}