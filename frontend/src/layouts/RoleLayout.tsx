import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { roleToPortal } from "@/routes/routes.config";
import PortalShell from "@/layouts/PortalShell";

/** Chọn layout cổng theo vai trò đăng nhập. */
const RoleLayout = () => {
  const { user } = useAuthStore();
  if (!user) return <Outlet />;
  return <PortalShell portal={roleToPortal(user.role)} />;
};

export default RoleLayout;
