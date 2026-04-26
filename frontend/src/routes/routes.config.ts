import type { Role } from "@/types/auth.types";
import type { LucideIcon } from "lucide-react";
import {
    Users, Package, LayoutDashboard, Building,
    FileText, ShoppingCart, BarChart3,
} from "lucide-react";
export type PortalId = "admin" | "hr" | "warehouse" | "sales" | "employee";

export interface RouteConfig {
    path: string;
    title: string;
    icon: LucideIcon;
    roles: Role[];
    portals: PortalId[];
    inSidebar: boolean;
}

export const ROUTE_CONFIGS: RouteConfig[] = [
    {
        path: "/admin/dashboard",
        title: "Tổng quan",
        icon: LayoutDashboard,
        roles: ["ADMIN"],
        portals: ["admin"],
        inSidebar: true,
    },
    {
        path: "/admin/users",
        title: "Quản lý User",
        icon: Users,
        roles: ["ADMIN"],
        portals: ["admin"],
        inSidebar: true,
    },
    {
        path: "/admin/report",
        title: "Báo cáo tổng hợp",
        icon: BarChart3,
        roles: ["ADMIN"],
        portals: ["admin"],
        inSidebar: true,
    },
    {
        path: "/admin/products",
        title: "Sản phẩm",
        icon: Package,
        roles: ["ADMIN"],
        portals: ["admin"],
        inSidebar: true,
    },
    {
        path: "/admin/suppliers",
        title: "Nhà cung cấp",
        icon: Building,
        roles: ["ADMIN"],
        portals: ["admin"],
        inSidebar: true,
    },
    {
        path: "/hr/employees",
        title: "Quản lý Nhân sự",
        icon: Users,
        roles: ["HR_MANAGER","ADMIN"],
        portals: ["hr","admin"],
        inSidebar: true,
    },
    {
        path: "/hr/leave-requests",
        title: "Duyệt đơn nghỉ",
        icon: FileText,
        roles: ["HR_MANAGER"],
        portals: ["hr","admin"],
        inSidebar: true,
    },
    {
        path: "/hr/salaries",
        title: "Quản lý Lương",
        icon: FileText,
        roles: ["HR_MANAGER"],
        portals: ["hr","admin"],
        inSidebar: true,
    },
    {
        path: "/hr/statistics",
        title: "Thống kê Nhân sự",
        icon: BarChart3,
        roles: ["HR_MANAGER"],
        portals: ["hr","admin"],
        inSidebar: true,
    },
    {
        path: "/warehouse/reports",
        title: "Báo cáo kho",
        icon: BarChart3,
        roles: ["WAREHOUSE_MANAGER"],
        portals: ["warehouse","admin"],
        inSidebar: true,
    },
    {
        path: "/warehouse/products",
        title: "Sản phẩm",
        icon: Package,
        roles: ["WAREHOUSE_MANAGER"],
        portals: ["warehouse"],
        inSidebar: true,
    },
    {
        path: "/warehouse/suppliers",
        title: "Nhà cung cấp",
        icon: Building,
        roles: ["WAREHOUSE_MANAGER",],
        portals: ["warehouse"],
        inSidebar: true,
    },
    {
        path: "/warehouse/import-slips",
        title: "Phiếu nhập",
        icon: Package,
        roles: ["WAREHOUSE_MANAGER"],
        portals: ["warehouse"],
        inSidebar: true,
    },
    {
        path: "/warehouse/categories",
        title: "Danh mục sản phẩm",
        icon: Package,
        roles: ["WAREHOUSE_MANAGER"],
        portals: ["warehouse"],
        inSidebar: true,
    },
    {
        path: "/sales/export-slips",
        title: "Phiếu xuất",
        icon: ShoppingCart,
        roles: ["SALES_MANAGER"],
        portals: ["sales"],
        inSidebar: true,
    },
    {
        path: "/sales/reports",
        title: "Báo cáo",
        icon: BarChart3,
        roles: ["SALES_MANAGER"],
        portals: ["sales"],
        inSidebar: true,
    },
    {
        path: "/employee/leave-request",
        title: "Xin nghỉ phép",
        icon: FileText,
        roles: ["EMPLOYEE", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        portals: ["employee", "warehouse", "sales"],
        inSidebar: true,
    },
    {
        path: "/employee/profile",
        title: "Hồ sơ cá nhân",
        icon: FileText,
        roles: ["EMPLOYEE", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        portals: ["employee", "hr", "warehouse", "sales"],
        inSidebar: true,
    },
    {
        path: "/employee/salary",
        title: "Bảng lương của tôi",
        icon: FileText,
        roles: ["EMPLOYEE", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        portals: ["employee", "hr", "warehouse", "sales"],
        inSidebar: true,
    },
];

/** Vai trò → cổng layout mặc định */
export const roleToPortal = (role: Role): PortalId => {
    switch (role) {
        case "ADMIN":
            return "admin";
        case "HR_MANAGER":
            return "hr";
        case "WAREHOUSE_MANAGER":
            return "warehouse";
        case "SALES_MANAGER":
            return "sales";
        case "EMPLOYEE":
        default:
            return "employee";
    }
};

export const rolesFor = (path: string): Role[] => {
    const set = new Set<Role>();
    for (const r of ROUTE_CONFIGS) {
        if (r.path === path) r.roles.forEach((role) => set.add(role));
    }
    return [...set];
};
