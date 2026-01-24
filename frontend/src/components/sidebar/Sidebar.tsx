import { MenuItems } from "./menu.config";
import type { UserRole } from "@/types";
import { LogOut, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import { NavLink } from "react-router-dom";


interface Props {
    role: UserRole;
    userName: string;
    onLogout: () => void;
}

export const Sidebar = ({ role, userName, onLogout }: Props) => {
    const menus = MenuItems.filter(item =>
        item.roles.includes(role)
    );

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="font-semibold">Quản lý</p>
                    <p className="text-xs text-gray-500">{userName}</p>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 space-y-1">
                {menus.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition
              ${isActive
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100 text-gray-700"
                            }`
                        }
                    >
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
                <Button variant="ghost" onClick={onLogout} className="w-full justify-start gap-3">
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
};
