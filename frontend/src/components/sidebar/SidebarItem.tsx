import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    path: string;
}

export const SidebarItem = memo(({ icon, label, path }: SidebarItemProps) => {
    return (
        <NavLink
            to={path}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                )
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
});

SidebarItem.displayName = 'SidebarItem';
