import type { Role } from "../../types/auth.type";
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
    roles: Role[];
}
export const MenuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: <LayoutDashboard className="w-5 h-5" />,
        path: '/dashboard',
        roles: ['ADMIN', 'HR_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_MANAGER', 'EMPLOYEE'],
    },
    {
        id: 'users',
        label: 'Quản lý User',
        icon: <UserCog className="w-5 h-5" />,
        path: 'admin/users',
        roles: ['ADMIN'],
    },
    {
        id: 'reports',
        label: 'Báo cáo Tổng hợp',
        icon: <BarChart3 className="w-5 h-5" />,
        path: '/reports',
        roles: ['ADMIN'],
    },
    {
        id: 'employees',
        label: 'Quản lý Nhân sự',
        icon: <Users className="w-5 h-5" />,
        path: '/employees',
        roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
        id: 'leave-requests',
        label: 'Đơn xin nghỉ',
        icon: <FileText className="w-5 h-5" />,
        path: '/leave-requests',
        roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
        id: 'salary',
        label: 'Quản lý Lương',
        icon: <FileText className="w-5 h-5" />,
        path: '/salary',
        roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
    },
    {
        id: 'products',
        label: 'Quản lý Sản phẩm',
        icon: <Package className="w-5 h-5" />,
        path: '/products',
        roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
    },
    {
        id: 'suppliers',
        label: 'Nhà cung cấp',
        icon: <Warehouse className="w-5 h-5" />,
        path: 'admin/suppliers',
        roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
    },
    {
        id: 'import-orders',
        label: 'Phiếu Nhập',
        icon: <Package className="w-5 h-5" />,
        path: '/import-orders',
        roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
    },
    {
        id: 'export-orders',
        label: 'Phiếu Xuất/Bán hàng',
        icon: <ShoppingCart className="w-5 h-5" />,
        path: '/export-orders',
        roles: ['ADMIN', 'SALES_MANAGER'],
    },
    {
        id: 'sales-reports',
        label: 'Báo cáo Kinh doanh',
        icon: <BarChart3 className="w-5 h-5" />,
        path: '/sales-reports',
        roles: ['ADMIN', 'SALES_MANAGER'],
    },
] 