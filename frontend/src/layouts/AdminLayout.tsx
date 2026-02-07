import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
    Users,
    Package,
    LayoutDashboard,
    LogOut,
    Menu,
    Building,
    FileText,
    ShoppingCart,
    BarChart3,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/auth.type";

interface MenuItem {
    title: string;
    href: string;
    icon: any;
    allowedRoles: Role[];
}

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const menuItems: MenuItem[] = [
        {
            title: "Tổng quan",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            allowedRoles: ["ADMIN", "HR_MANAGER", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        },
        {
            title: "Quản lý User",
            href: "/admin/users",
            icon: Users,
            allowedRoles: ["ADMIN"],
        },
        {
            title: "Quản lý Nhân sự",
            href: "/admin/hr",
            icon: Users,
            allowedRoles: ["ADMIN", "HR_MANAGER"],
        },
        {
            title: "Đơn xin nghỉ",
            href: "/admin/leave-requests",
            icon: FileText,
            allowedRoles: ["ADMIN", "HR_MANAGER", "EMPLOYEE", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        },
        {
            title: "Quản lý Lương",
            href: "/admin/salary",
            icon: FileText,
            allowedRoles: ["ADMIN", "HR_MANAGER"],
        },
        {
            title: "Quản lý Sản phẩm",
            href: "/admin/products",
            icon: Package,
            allowedRoles: ["ADMIN", "WAREHOUSE_MANAGER", "SALES_MANAGER"],
        },
        {
            title: "Nhà cung cấp",
            href: "/admin/suppliers",
            icon: Building,
            allowedRoles: ["ADMIN", "WAREHOUSE_MANAGER"],
        },
        {
            title: "Phiếu Nhập",
            href: "/admin/import-slips",
            icon: Package,
            allowedRoles: ["ADMIN", "WAREHOUSE_MANAGER"],
        },
        {
            title: "Phiếu Xuất/Bán hàng",
            href: "/admin/export-slips",
            icon: ShoppingCart,
            allowedRoles: ["ADMIN", "SALES_MANAGER"],
        },
        {
            title: "Báo cáo Kinh doanh",
            href: "/admin/reports",
            icon: BarChart3,
            allowedRoles: ["ADMIN", "SALES_MANAGER"],
        },

    ];

    const filteredMenuItems = menuItems.filter(item =>
        user && item.allowedRoles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 transition-all duration-300 transform",
                    isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0 lg:w-20"
                )}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1 rounded-md">
                                <Briefcase className="text-white h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">Electronics Store</h1>
                                <p className="text-xs text-gray-500">{user?.profile?.fullName || user?.email || "Admin"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-600 p-2 rounded-md">
                            <Briefcase className="text-white h-6 w-6" />
                        </div>
                    )}
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
                    {filteredMenuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                                title={item.title}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5",
                                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                                )} />
                                {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-auto border-t border-gray-100">
                        <button
                            onClick={() => logout()}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left group hover:bg-red-50 text-gray-600 hover:text-red-600"
                            )}>
                            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                            {isSidebarOpen && <span className="font-medium text-sm">Đăng xuất</span>}
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300 min-h-screen",
                isSidebarOpen ? "ml-64" : "ml-0 lg:ml-20"
            )}>
                {/* Mobile Header trigger */}
                <div className="lg:hidden h-16 bg-white border-b flex items-center px-4 sticky top-0 z-40">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="ml-4 font-bold text-gray-800">Electronics Store</span>
                </div>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
