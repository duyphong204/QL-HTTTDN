import { lazy, Suspense, useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./ProtectedRoute";
import RoleLayout from "@/layouts/RoleLayout";
import NotFoundPage from "@/pages/NotFoundPage";
import { rolesFor } from "@/routes/routes.config";
import ShopLayout from "@/layouts/ShopLayout";

const HomePage = lazy(() => import("@/pages/admin/HomePage"));
const PromotionManagement = lazy(() => import("@/pages/admin/PromotionManagement"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const SupplierManagement = lazy(() => import("@/pages/admin/SupplierManagement"));
const ProductManagement = lazy(() => import("@/pages/warehouse/ProductManagement"));
const CategoryManagement = lazy(() => import("@/pages/warehouse/CategoryManagement"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const SalaryManagement = lazy(() => import("@/pages/hr/SalaryManagement"));
const LeaveRequestPage = lazy(() => import("@/pages/employee/EmployeeLeaveRequestPage"));
const EmployeeManagement = lazy(() => import("@/pages/hr/EmployeeManagement"));
const LeaveRequestManagement = lazy(() => import("@/pages/hr/LeaveRequestManagement"));
const MySalaryPage = lazy(() => import("@/pages/employee/MySalaryPage"));
const ProfilePage = lazy(() => import("@/pages/employee/ProfilePage"));
const SalesOrderManagement = lazy(() => import("@/pages/sales/SalesOrderManagement"));
const ExportSlipManagement = lazy(() => import("@/pages/sales/ExportSlipManagement"));
const ImportSlipManagement = lazy(() => import("@/pages/warehouse/ImportSlipManagement"));
const AdminReportPage = lazy(() => import("@/pages/admin/AdminReportPage"));
const SalesReportPage = lazy(() => import("@/pages/sales/SalesReportPage"));
const WarehouseReportPage = lazy(() => import("@/pages/warehouse/WarehouseReportPage"));
const HrReportPage = lazy(() => import("@/pages/hr/HrReportPage"));
const HrStatisticsPage = lazy(() => import("@/pages/hr/HrStatisticsPage"));
const ShopHome = lazy(() => import("@/pages/customer/ShopHome"));
const ProductList = lazy(() => import("@/pages/customer/ProductList"));
const ProductDetail = lazy(() => import("@/pages/customer/ProductDetail"));
const CartPage = lazy(() => import("@/pages/customer/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/customer/CheckoutPage"));
const CustomerOrders = lazy(() => import("@/pages/customer/CustomerOrders"));
const OrderSuccess = lazy(() => import("@/pages/customer/OrderSuccess"));
const PaymentReturn = lazy(() => import("@/pages/customer/PaymentReturn"));
const Profile = lazy(() => import("@/pages/customer/Profile"));
const About = lazy(() => import("@/pages/customer/About"));
const Contact = lazy(() => import("@/pages/customer/Contact"));

function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
      Đang tải trang...
    </div>
  );
}
export const AppRouter = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return (
    <>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Auth Routes - không protected */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes - bọc với ProtectedRoute để check auth trước khi render layout */}
          <Route
            element={
              <ProtectedRoute>
                <RoleLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<HomePage />} />
            <Route path="/admin/dashboard" element={<HomePage />} />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={rolesFor("/admin/users")}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/promotions"
            element={
              <ProtectedRoute roles={rolesFor("/admin/promotions")}>
                <PromotionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/products")}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/suppliers")}>
                <SupplierManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute roles={rolesFor("/hr/employees")}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/salaries"
            element={
              <ProtectedRoute roles={rolesFor("/hr/salaries")}>
                <SalaryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/leave-requests"
            element={
              <ProtectedRoute roles={rolesFor("/hr/leave-requests")}>
                <LeaveRequestManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/leave-request"
            element={
              <ProtectedRoute roles={rolesFor("/employee/leave-request")}>
                <LeaveRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/salary"
            element={
              <ProtectedRoute roles={rolesFor("/employee/salary")}>
                <MySalaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute roles={rolesFor("/employee/profile")}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/categories"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/categories")}>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/products"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/products")}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/suppliers"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/suppliers")}>
                <SupplierManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse/import-slips"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/import-slips")}>
                <ImportSlipManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/orders"
            element={
              <ProtectedRoute roles={rolesFor("/sales/orders")}>
                <SalesOrderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/export-slips"
            element={
              <ProtectedRoute roles={rolesFor("/sales/export-slips")}>
                <ExportSlipManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={rolesFor("/admin/reports")}>
                <AdminReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/reports"
            element={
              <ProtectedRoute roles={rolesFor("/sales/reports")}>
                <SalesReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/reports"
            element={
              <ProtectedRoute roles={rolesFor("/warehouse/reports")}>
                <WarehouseReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/reports"
            element={
              <ProtectedRoute roles={rolesFor("/hr/reports")}>
                <HrReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/statistics"
            element={
              <ProtectedRoute roles={rolesFor("/hr/employees")}>
                <HrStatisticsPage />
              </ProtectedRoute>
            }
          />
          </Route>
          {/* Customer Routes */}
          <Route path="/" element={<ShopLayout />}>
            <Route index element={<ShopHome />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute roles={["CUSTOMER"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute roles={["CUSTOMER"]}>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders/:id"
              element={
                <ProtectedRoute roles={["CUSTOMER"]}>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute roles={["CUSTOMER"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="order-success/:id"
              element={
                <ProtectedRoute roles={["CUSTOMER"]}>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route path="payment-return" element={<PaymentReturn />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster position="top-left" richColors />
    </>
  );
};
