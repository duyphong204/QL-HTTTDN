import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { roleToPortal } from "@/routes/routes.config";
import PortalShell from "@/layouts/PortalShell";

/** Chọn layout cổng theo vai trò đăng nhập. */
const RoleLayout = () => {
    const { user } = useAuth();
    if (!user) return <Outlet />;
    return <PortalShell portal={roleToPortal(user.role)} />;
};

export default RoleLayout;
