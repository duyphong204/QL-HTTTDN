import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import { Navigate, Route, Routes } from "react-router-dom"

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
            <Route path="*" element={<Navigate to={PATHS.LOGIN} />} />
        </Routes>
    )
}