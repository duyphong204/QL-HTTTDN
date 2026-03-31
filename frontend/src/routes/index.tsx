import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/layouts/AppLayout';
import HomePage from '@/pages/admin/HomePage';
import UserManagement from '@/pages/admin/UserManagement';
import SupplierManagement from '@/pages/admin/SupplierManagement';
import ProductManagement from '@/pages/admin/ProductPage';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useLayoutEffect } from 'react';
import { Toaster } from 'sonner';
import NotFoundPage from '@/pages/NotFoundPage';
import SalaryManagement from '@/pages/hr/SalaryManagement';
import LeaveRequestPage from '@/pages/employee/EmployeeLeaveRequestPage';
import EmployeeManagement from '@/pages/hr/EmployeeManagement';
import LeaveRequestManagement from '@/pages/hr/LeaveRequestManagement';
import MySalaryPage from '@/pages/employee/MySalaryPage';
import ProfilePage from '@/pages/employee/ProfilePage';
import { rolesFor } from "@/routes/routes.config";
// IMPORT CUSTOMER PAGES
import ShopHome from '@/pages/customer/ShopHome';
import ProductList from '@/pages/customer/ProductList';
import ProductDetail from '@/pages/customer/ProductDetail';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import CustomerOrders from '@/pages/customer/CustomerOrders';
import ShopLayout from '@/layouts/ShopLayout';
import OrderSuccess from '@/pages/customer/OrderSuccess';
import PaymentReturn from '@/pages/customer/PaymentReturn';
import Profile from '@/pages/customer/Profile';
import About from '@/pages/customer/About';
import Contact from '@/pages/customer/Contact';
export const AppRouter = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<HomePage />} />
          <Route path="/admin/dashboard" element={<HomePage />} />

          <Route path="/admin/users" element={
            <ProtectedRoute roles={rolesFor("/admin/users")}><UserManagement /></ProtectedRoute>
          } />

          <Route path="/hr/employees" element={
            <ProtectedRoute roles={rolesFor("/hr/employees")}><EmployeeManagement /></ProtectedRoute>
          } />
          <Route path="/hr/salaries" element={
            <ProtectedRoute roles={rolesFor("/hr/salaries")}><SalaryManagement /></ProtectedRoute>
          } />
          <Route path="/hr/leave-requests" element={
            <ProtectedRoute roles={rolesFor("/hr/leave-requests")}><LeaveRequestManagement /></ProtectedRoute>
          } />

          <Route path="/employee/leave-request" element={
            <ProtectedRoute roles={rolesFor("/employee/leave-request")}><LeaveRequestPage /></ProtectedRoute>
          } />
          <Route path="/employee/salary" element={
            <ProtectedRoute roles={rolesFor("/employee/salary")}><MySalaryPage /></ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute roles={rolesFor("/employee/profile")}><ProfilePage /></ProtectedRoute>
          } />

          <Route path="/warehouse/products" element={
            <ProtectedRoute roles={rolesFor("/warehouse/products")}><ProductManagement /></ProtectedRoute>
          } />
          <Route path="/warehouse/suppliers" element={
            <ProtectedRoute roles={rolesFor("/warehouse/suppliers")}><SupplierManagement /></ProtectedRoute>
          } />
        </Route>
          {/* Customer Routes */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<ShopHome />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute><CustomerOrders /></ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute><CustomerOrders /></ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="order-success/:id" element={
            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
          } />
          <Route path="payment-return" element={<PaymentReturn />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
};