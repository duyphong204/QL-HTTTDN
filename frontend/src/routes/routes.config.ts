import type { Role } from "@/types/auth.type";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Package,
  LayoutDashboard,
  Building,
  FileText,
  ShoppingCart,
  BarChart3,
  Tag,
  Folder,
} from "lucide-react";

export interface RouteConfig {
  path: string;
  title: string;
  icon: LucideIcon;
  roles: Role[];
  inSidebar: boolean;
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  {
    path: "/admin/dashboard",
    title: "Tổng quan",
    icon: LayoutDashboard,
    roles: ["ADMIN", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/admin/users",
    title: "Quản lý User",
    icon: Users,
    roles: ["ADMIN"],
    inSidebar: true,
  },
  {
    path: "/hr/employees",
    title: "Quản lý Nhân sự",
    icon: Users,
    roles: ["HR_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/hr/leave-requests",
    title: "Duyệt đơn nghỉ",
    icon: FileText,
    roles: ["HR_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/hr/salaries",
    title: "Quản lý Lương",
    icon: FileText,
    roles: ["HR_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/admin/promotions",
    title: "Khuyen mai",
    icon: Tag,
    roles: ["ADMIN"],
    inSidebar: true,
  },
  {
    path: "/warehouse/categories",
    title: "Danh mục sản phẩm",
    icon: Folder,
    roles: ["ADMIN", "WAREHOUSE_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/warehouse/products",
    title: "Sản phẩm",
    icon: Package,
    roles: ["ADMIN", "WAREHOUSE_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/warehouse/suppliers",
    title: "Nhà cung cấp",
    icon: Building,
    roles: ["ADMIN", "WAREHOUSE_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/warehouse/import-slips",
    title: "Phiếu nhập",
    icon: Package,
    roles: ["WAREHOUSE_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/sales/orders",
    title: "Đơn hàng",
    icon: ShoppingCart,
    roles: ["SALES_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/sales/export-slips",
    title: "Phiếu xuất",
    icon: ShoppingCart,
    roles: ["SALES_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/sales/reports",
    title: "Báo cáo",
    icon: BarChart3,
    roles: ["ADMIN", "SALES_MANAGER"],
    inSidebar: true,
  },
  {
    path: "/employee/leave-request",
    title: "Xin nghỉ phép",
    icon: FileText,
    roles: ["EMPLOYEE"],
    inSidebar: true,
  },
  {
    path: "/employee/profile",
    title: "Hồ sơ cá nhân",
    icon: FileText,
    roles: ["EMPLOYEE"],
    inSidebar: true,
  },
  {
    path: "/employee/salary",
    title: "Bảng lương của tôi",
    icon: FileText,
    roles: ["EMPLOYEE"],
    inSidebar: true,
  },
];
// CUSTOMER / STOREFRONT ROUTES
export const customerRoutes = [
  {
    path: "/",
    element: "ShopHome",
  },
  {
    path: "/products",
    element: "ProductList",
  },
  {
    path: "/products/:id",
    element: "ProductDetail",
  },
  {
    path: "/cart",
    element: "CartPage",
  },
  {
    path: "/checkout",
    element: "CheckoutPage",
  },
  {
    path: "/orders",
    element: "CustomerOrders",
  },
  {
    path: "/profile",
    element: "Profile",
  },
  {
    path: "/order-success",
    element: "OrderSuccess",
  },
  {
    path: "/about",
    element: "About",
  },
  {
    path: "/contact",
    element: "Contact",
  },
];
export const rolesFor = (path: string): Role[] =>
  ROUTE_CONFIGS.find((r) => r.path === path)?.roles ?? [];
