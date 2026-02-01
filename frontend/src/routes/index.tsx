import ProtectedRoute from "./ProtectedRoute"
import HomePage from "@/pages/admin/HomePage"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import { Route, Routes } from "react-router-dom"

export const PATHS = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    HOME: '/'
}
export const AppRouter = () => {
    return (
        <Routes>
            <Route path={PATHS.LOGIN} element={<LoginPage />} />
            <Route path={PATHS.REGISTER} element={<RegisterPage />} />
            {/* private route  */}
            <Route
                path={PATHS.HOME}
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } />
        </Routes>
    )
}