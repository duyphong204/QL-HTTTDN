import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, UserCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const items = useCartStore((state) => state.items);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  const submitSearch = useCallback(
    (value: string) => {
      const nextSearch = value.trim();
      const nextParams = new URLSearchParams();

      if (nextSearch) {
        nextParams.set("search", nextSearch);
      }

      navigate(
        `/products${nextParams.toString() ? `?${nextParams.toString()}` : ""}`,
      );
      setOpen(false);
    },
    [navigate],
  );

  const total = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (!location.pathname.startsWith("/products")) {
      return;
    }

    const params = new URLSearchParams(location.search);
    setSearchText(params.get("search") ?? "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isScrolled
          ? "bg-white/75 border-white/40 shadow-sm"
          : "bg-white border-gray-200/80 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
              N
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter flex items-baseline relative group">
              {/* Lớp bóng mờ phía sau tạo chiều sâu khi hover */}
              <span
                className="absolute -inset-0.5 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-blue-900/20 select-none whitespace-nowrap"
                aria-hidden="true"
              >
                TechStore
              </span>

              {/* Phần "Tech" - Giữ kích thước cũ + Gradient CHUYỂN ĐỘNG */}
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-500 via-indigo-600 to-blue-800 bg-[length:200%_auto] animate-gradient-flow transition-all group-hover:drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">
                Tech
              </span>

              {/* Phần "Store" - Giữ kích thước cũ + Đen mờ & Hào quang */}
              <span className="relative text-gray-950 ml-0.5 transition-all group-hover:drop-shadow-[0_0_8px_rgba(17,24,39,0.5)]">
                Store
              </span>
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 lg:gap-10 text-base font-semibold">
            <Link
              to="/products"
              className="text-gray-800 hover:text-blue-700 transition-colors duration-200 relative group"
            >
              Sản phẩm
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/about"
              className="text-gray-800 hover:text-blue-700 transition-colors duration-200 relative group"
            >
              Giới thiệu
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/contact"
              className="text-gray-800 hover:text-blue-700 transition-colors duration-200 relative group"
            >
              Liên hệ
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-5 sm:gap-7">
            {/* Search desktop */}
            <div className="hidden md:block relative w-56 lg:w-72 xl:w-96">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submitSearch(searchText);
                  }
                }}
                className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => submitSearch(searchText)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors p-1"
                aria-label="Tìm kiếm"
              >
                <Search size={20} />
              </button>
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-700 transition-colors relative p-2"
            >
              <ShoppingCart size={24} strokeWidth={1.7} />
              {total > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 shadow">
                  {total}
                </span>
              )}
            </Link>

            {/* User */}
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className="text-gray-700 hover:text-blue-700 transition-colors p-2"
            >
              <UserCircle size={26} strokeWidth={1.7} />
            </Link>

            {/* Hamburger */}
            <button
              className="lg:hidden text-gray-700 p-2 -mr-2"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden border-t bg-white">
        <div className="px-4 py-3 max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitSearch(searchText);
                }
              }}
              className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 shadow-inner"
            />
            <button
              type="button"
              onClick={() => submitSearch(searchText)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors p-1"
              aria-label="Tìm kiếm"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t shadow-xl">
          <div className="px-4 py-6 flex flex-col gap-3 text-lg font-medium">
            <Link
              to="/products"
              className="text-gray-800 hover:bg-blue-50 hover:text-blue-700 py-4 px-5 rounded-xl transition-colors flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link
              to="/about"
              className="text-gray-800 hover:bg-blue-50 hover:text-blue-700 py-4 px-5 rounded-xl transition-colors flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              Giới thiệu
            </Link>
            <Link
              to="/contact"
              className="text-gray-800 hover:bg-blue-50 hover:text-blue-700 py-4 px-5 rounded-xl transition-colors flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              Liên hệ
            </Link>
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className="text-gray-800 hover:bg-blue-50 hover:text-blue-700 py-4 px-5 rounded-xl transition-colors flex items-center gap-3 border-t pt-5 mt-2"
              onClick={() => setOpen(false)}
            >
              <UserCircle size={24} />
              {isAuthenticated ? "Tài khoản" : "Đăng nhập / Đăng ký"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
