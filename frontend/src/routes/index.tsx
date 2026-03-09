import ProtectedRoute from "./ProtectedRoute"
import { MainLayout } from "@/layouts/MainLayout"
import AdminLayout from "@/layouts/AdminLayout"
import HomePage from "@/pages/admin/HomePage"
import UserManagement from "@/pages/admin/UserManagement"
import SupplierManagement from "@/pages/admin/SupplierManagement"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import HomePageCustomer from "@/pages/customer/HomePage"
import CardPage from "@/pages/customer/CartPage"
import ShopLayout from "@/layouts/ShopLayout"

import { Route, Routes } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { useEffect } from "react"
import { Toaster } from 'sonner'
import ProductsPage from "@/pages/customer/ProductsPage"
import OrdersPage from "@/pages/customer/OderPage"


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
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout /></ProtectedRoute>}>
                    <Route path="/admin" element={<HomePage />} />
                    <Route path={PATHS.DASHBOARD} element={<HomePage />} />
                    <Route path={PATHS.ADMIN_USERS} element={<UserManagement />} />
                    <Route path={PATHS.ADMIN_SUPPLIERS} element={<SupplierManagement />} />
                </Route>

                {/* Other Main Layout Routes (if any separate from Admin) */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path={PATHS.HOME} element={<HomePage />} />
                </Route>

                {/* Customer Shop Routes */}
                <Route element={<ShopLayout />}>
                    <Route path="/customer" element={<HomePageCustomer />} />
                    <Route path="/customer/products" element={<ProductsPage />} />
                    <Route path="/customer/cart" element={<CardPage />} />
                    <Route path="/customer/orders" element={<OrdersPage />} />
                    {/* Add more customer routes here */}
                </Route>


            </Routes>
            <Toaster position="top-right" richColors />
        </>
    )
}