import type { Role } from "@/types/auth.type";
import type { LucideIcon } from "lucide-react";
import {
    Users, Package, LayoutDashboard, Building,
    FileText, ShoppingCart, BarChart3,
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
        roles: ["HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER", "ADMIN"],
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
        path: "/admin/report",
        title: "Báo cáo tổng hợp",
        icon: BarChart3,
        roles: ["ADMIN"],
        inSidebar: true,
    },
    {
        path: "/hr/employees",
        title: "Quản lý Nhân sự",
        icon: Users,
        roles: ["HR_MANAGER", "ADMIN"],
        inSidebar: true,
    },
    {
        path: "/hr/leave-requests",
        title: "Duyệt đơn nghỉ",
        icon: FileText,
        roles: ["HR_MANAGER", "ADMIN"],
        inSidebar: true,
    },
    {
        path: "/hr/salaries",
        title: "Quản lý Lương",
        icon: FileText,
        roles: ["HR_MANAGER", "ADMIN"],
        inSidebar: true,
    },
    {
        path: "/hr/statistics",
        title: "Thống kê Nhân sự",
        icon: BarChart3,
        roles: ["HR_MANAGER", "ADMIN"],
        inSidebar: true,
    },
    {
        path: "/warehouse/reports",
        title: "Báo cáo kho",
        icon: BarChart3,
        roles: ["WAREHOUSE_MANAGER", "ADMIN"],
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
        roles: ["WAREHOUSE_MANAGER", "ADMIN"],
        inSidebar: true,
    },
    {
        path: "/sales/export-slips",
        title: "Phiếu xuất",
        icon: ShoppingCart,
        roles: ["SALES_MANAGER", "ADMIN"],
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
        roles: ["EMPLOYEE", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        inSidebar: true,
    },
    {
        path: "/employee/profile",
        title: "Hồ sơ cá nhân",
        icon: FileText,
        roles: ["EMPLOYEE", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        inSidebar: true,
    },
    {
        path: "/employee/salary",
        title: "Bảng lương của tôi",
        icon: FileText,
        roles: ["EMPLOYEE", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        inSidebar: true,
    },
    {
        path: "/warehouse/categories",
        title: "Danh mục sản phẩm",
        icon: Package,
        roles: ["WAREHOUSE_MANAGER", "ADMIN"],
        inSidebar: true,
    },
];

export const rolesFor = (path: string): Role[] =>
    ROUTE_CONFIGS.find((r) => r.path === path)?.roles ?? [];
