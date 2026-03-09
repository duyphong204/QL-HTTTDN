import ProtectedRoute from "./ProtectedRoute"
import AdminLayout from "@/layouts/AppLayout"
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
import LeaveRequestPage from "@/pages/employee/EmployeeLeaveRequestPage"
import EmployeeManagement from "@/pages/hr/EmployeeManagement"
import LeaveRequestManagement from "@/pages/hr/LeaveRequestManagement"
import MySalaryPage from "@/pages/employee/MySalaryPage"
import ProfilePage from "@/pages/employee/ProfilePage"

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
                    <Route path="/hr/employees" element={<EmployeeManagement />} />
                    <Route path="/hr/leave-requests" element={<LeaveRequestManagement />} />

                    {/* Employee */}
                    <Route path="/employee/leave-request" element={<LeaveRequestPage />} />
                    <Route path="/employee/salary" element={<MySalaryPage />} />
                    <Route path='/employee/profile' element={<ProfilePage />} />

                    {/* Warehouse */}
                    <Route path="/warehouse/suppliers" element={<SupplierManagement />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster position="top-right" richColors />
        </>
    )
}