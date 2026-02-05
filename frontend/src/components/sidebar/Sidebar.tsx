import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { MenuItems } from './menu.config';
import { SidebarItem } from './SidebarItem';
import { useAuthStore } from "@/store/auth.store"
import { LogOut } from 'lucide-react';
import { useMemo } from 'react';

export const Sidebar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    if (!user) return null;

    const filteredItems = useMemo(() => {
        return MenuItems.filter((item) => item.roles.includes(user.role));
    }, [user.role]);

    return (
        <aside className="w-64 h-screen border-r bg-white flex flex-col">
            {/* Header */}
            <div className="p-3 border-b">
                <h2 className="text-lg font-semibold">Electronics Store</h2>
                <p className="text-sm text-muted-foreground">
                    {user.profile?.fullName || user.email}
                </p>
            </div>

            <Separator />

            {/* Menu */}
            <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-1">
                    {filteredItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                        />
                    ))}
                </div>
            </ScrollArea>

            <Separator />

            {/* Logout */}
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    );
};
