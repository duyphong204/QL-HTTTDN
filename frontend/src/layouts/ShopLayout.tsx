import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Shop/Header";
import Footer from "@/components/Shop/Footer";
import { useAuthStore } from "@/stores/auth.store";
import { roleToPortal } from "@/routes/routes.config";

export default function ShopLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== "CUSTOMER") {
      const portal = roleToPortal(user.role);
      navigate(`/${portal}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 p-4 sm:p-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
