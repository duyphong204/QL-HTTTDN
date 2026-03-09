import { Outlet } from "react-router-dom";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";

const ShopLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default ShopLayout;