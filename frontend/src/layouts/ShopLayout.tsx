import { Outlet } from "react-router-dom";
import Header from "@/components/Shop/Header";
import Footer from "@/components/Shop/Footer";

export default function ShopLayout() {
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
