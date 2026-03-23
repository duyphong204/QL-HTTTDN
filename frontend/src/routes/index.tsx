import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '@/layouts/AppLayout';
import HomePage from '@/pages/admin/HomePage';
import UserManagement from '@/pages/admin/UserManagement';
import SupplierManagement from '@/pages/admin/SupplierManagement';
// import ProductManagement from '@/pages/admin/ProductPage';
import ProductManagement from '@/pages/warehouse/ProductManagement';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import { Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import NotFoundPage from '@/pages/NotFoundPage';
import SalaryManagement from '@/pages/hr/SalaryManagement';
import LeaveRequestPage from '@/pages/employee/EmployeeLeaveRequestPage';
import EmployeeManagement from '@/pages/hr/EmployeeManagement';
import LeaveRequestManagement from '@/pages/hr/LeaveRequestManagement';
import MySalaryPage from '@/pages/employee/MySalaryPage';
import ProfilePage from '@/pages/employee/ProfilePage';
import { rolesFor } from "@/routes/routes.config";
import ImportSlipManagement from '@/pages/warehouse/ImportSlipManagement';
import ReportPage from '@/pages/admin/ReportPage';
import WarehouseReportPage from '@/pages/warehouse/WarehouseReportPage';
import ExportSlipManagement from '@/pages/sales/ExportSlipManagement';
import SalesReportPage from '@/pages/sales/SalesReportPage';


export const AppRouter = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<HomePage />} />
          <Route path="/admin/dashboard" element={<HomePage />} />

          <Route path="/admin/users" element={
            <ProtectedRoute roles={rolesFor("/admin/users")}><UserManagement /></ProtectedRoute>
          } />
          <Route path="/admin/report" element={
            <ProtectedRoute roles={rolesFor("/admin/report")}><ReportPage /></ProtectedRoute>
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
          <Route path="/warehouse/import-slips" element={
            <ProtectedRoute roles={rolesFor("/warehouse/import-slips")}><ImportSlipManagement /></ProtectedRoute>
          } />
          <Route path="/warehouse/reports" element={
            <ProtectedRoute roles={rolesFor("/warehouse/reports")}><WarehouseReportPage /></ProtectedRoute>
          } />
          <Route path="/sales/export-slips" element={
            <ProtectedRoute roles={rolesFor("/sales/export-slips")}><ExportSlipManagement /></ProtectedRoute>
          } />
          <Route path="/sales/reports" element={
            <ProtectedRoute roles={rolesFor("/sales/reports")}><SalesReportPage /></ProtectedRoute>
          } />

        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
};