import type { UserRole } from "@/types";
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    FileText,
    BarChart3,
    UserCog,
    Warehouse,
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    roles: UserRole[];
}
export const MenuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: <LayoutDashboard className="w-5 h-5" />,
        path: '/dashboard',
        roles: ['admin', 'hr_manager', 'warehouse_manager', 'sales_manager', 'employee'],
    },
    {
        id: 'users',
        label: 'Quản lý User',
        icon: <UserCog className="w-5 h-5" />,
        path: '/users',
        roles: ['admin'],
    },
    {
        id: 'reports',
        label: 'Báo cáo Tổng hợp',
        icon: <BarChart3 className="w-5 h-5" />,
        path: '/reports',
        roles: ['admin'],
    },
    {
        id: 'employees',
        label: 'Quản lý Nhân sự',
        icon: <Users className="w-5 h-5" />,
        path: '/employees',
        roles: ['admin', 'hr_manager', 'employee'],
    },
    {
        id: 'leave-requests',
        label: 'Đơn xin nghỉ',
        icon: <FileText className="w-5 h-5" />,
        path: '/leave-requests',
        roles: ['admin', 'hr_manager', 'employee'],
    },
    {
        id: 'salary',
        label: 'Quản lý Lương',
        icon: <FileText className="w-5 h-5" />,
        path: '/salary',
        roles: ['admin', 'hr_manager', 'employee'],
    },
    {
        id: 'products',
        label: 'Quản lý Sản phẩm',
        icon: <Package className="w-5 h-5" />,
        path: '/products',
        roles: ['admin', 'warehouse_manager'],
    },
    {
        id: 'suppliers',
        label: 'Nhà cung cấp',
        icon: <Warehouse className="w-5 h-5" />,
        path: '/suppliers',
        roles: ['admin', 'warehouse_manager'],
    },
    {
        id: 'import-orders',
        label: 'Phiếu Nhập',
        icon: <Package className="w-5 h-5" />,
        path: '/import-orders',
        roles: ['admin', 'warehouse_manager'],
    },
    {
        id: 'export-orders',
        label: 'Phiếu Xuất/Bán hàng',
        icon: <ShoppingCart className="w-5 h-5" />,
        path: '/export-orders',
        roles: ['admin', 'sales_manager'],
    },
    {
        id: 'sales-reports',
        label: 'Báo cáo Kinh doanh',
        icon: <BarChart3 className="w-5 h-5" />,
        path: '/sales-reports',
        roles: ['admin', 'sales_manager'],
    },
] 