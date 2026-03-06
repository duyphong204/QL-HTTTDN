import ProtectedRoute from "./ProtectedRoute"
import AdminLayout from "@/layouts/AdminLayout"
import HomePage from "@/pages/admin/HomePage"
import UserManagement from "@/pages/admin/UserManagement"
import SupplierManagement from "@/pages/admin/SupplierManagement"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import { Route, Routes } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"
import { Toaster } from "sonner"
import NotFoundPage from "@/pages/NotFoundPage"
import SalaryManagement from "@/pages/hr/SalaryManagement"
import LeaveRequestPage from "@/pages/employee/LeaveRequestPage"
export const AppRouter = () => {
    const checkAuth = useAuthStore((state) => state.checkAuth)

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return (
        <>
            <Routes>

                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected admin routes */}
                <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    {/* Trang chủ */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin" element={<HomePage />} />
                    <Route path="/admin/dashboard" element={<HomePage />} />
                    
                    {/* Admin only */}
                    <Route path="/admin/users" element={<UserManagement />} />
                    
                    {/* HR */}
                    <Route path="/hr/salaries" element={<SalaryManagement />} />
                    
                    {/* Employee */}
                    <Route path="/employee/leave-request" element={<LeaveRequestPage />} />
                    
                    {/* Warehouse */}
                    <Route path="/warehouse/suppliers" element={<SupplierManagement />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster position="top-right" richColors />
        </>
    )
}