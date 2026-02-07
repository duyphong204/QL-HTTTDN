import ProtectedRoute from "./ProtectedRoute"
import { MainLayout } from "@/layouts/MainLayout"
import AdminLayout from "@/layouts/AdminLayout"
import HomePage from "@/pages/admin/HomePage"
import UserManagement from "@/pages/admin/UserManagement"
import SupplierManagement from "@/pages/admin/SupplierManagement"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import { Route, Routes } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"
import { Toaster } from 'sonner'

export const PATHS = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_SUPPLIERS: '/admin/suppliers',
    HOME: '/'
}

export const AppRouter = () => {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route path={PATHS.LOGIN} element={<LoginPage />} />
                <Route path={PATHS.REGISTER} element={<RegisterPage />} />

                {/* Secure Admin Routes */}
                <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route path="/admin" element={<HomePage />} />
                    <Route path={PATHS.DASHBOARD} element={<HomePage />} />
                    <Route path={PATHS.ADMIN_USERS} element={<UserManagement />} />
                    <Route path={PATHS.ADMIN_SUPPLIERS} element={<SupplierManagement />} />
                </Route>

                {/* Other Main Layout Routes (if any separate from Admin) */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path={PATHS.HOME} element={<HomePage />} />
                </Route>
            </Routes>
            <Toaster position="top-right" richColors />
        </>
    )
}