import { ShoppingCart, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useSalesStore } from "@/store/Sales.store";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const cart = useSalesStore((state) => state.cart);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/customer" className="text-2xl font-bold text-blue-600">
          ShopHub
        </Link>

        <nav className="flex gap-6">
          <Link to="/customer" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/customer/products" className="hover:text-blue-600">Sản phẩm</Link>
          <Link to="/customer/orders" className="hover:text-blue-600">Đơn hàng</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/customer/cart" className="relative">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <User size={20} />
            <span>{user?.email || 'Khách'}</span>
          </div>

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}