import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  Smartphone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main Footer - Thu gọn */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Column 1: Brand + Newsletter */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                N
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                TechStore
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed text-sm max-w-xs">
              Cửa hàng công nghệ chính hãng – Điện thoại, laptop, phụ kiện chất
              lượng cao với giá tốt nhất.
            </p>

            {/* Social - Thu nhỏ icon */}
            <div className="flex gap-5">
              <a
                href="https://facebook.com/techstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-200"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://twitter.com/techstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-200"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://instagram.com/techstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-200"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://youtube.com/techstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 hover:scale-110 transition-all duration-200"
              >
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Column 2: Cửa hàng */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5 tracking-wide">
              Cửa hàng
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/products?category=phones"
                  className="hover:text-blue-500 transition-colors"
                >
                  Điện thoại
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=laptops"
                  className="hover:text-blue-500 transition-colors"
                >
                  Laptop
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=tablets"
                  className="hover:text-blue-500 transition-colors"
                >
                  Máy tính bảng
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=accessories"
                  className="hover:text-blue-500 transition-colors"
                >
                  Phụ kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=smartwatch"
                  className="hover:text-blue-500 transition-colors"
                >
                  Đồng hồ thông minh
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hỗ trợ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5 tracking-wide">
              Hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-500 transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-returns"
                  className="hover:text-blue-500 transition-colors"
                >
                  Vận chuyển & Đổi trả
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty"
                  className="hover:text-blue-500 transition-colors"
                >
                  Bảo hành
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-blue-500 transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="hover:text-blue-500 transition-colors"
                >
                  Theo dõi đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Công ty */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5 tracking-wide">
              Công ty
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-500 transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-blue-500 transition-colors"
                >
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-blue-500 transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-blue-500 transition-colors"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Thu gọn */}
      <div className="border-t border-gray-800 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-400">
          <div className="flex items-center gap-5">
            <CreditCard size={24} className="text-gray-500" />
            <Smartphone size={24} className="text-gray-500" />
            <p>Thanh toán an toàn</p>
          </div>

          <p>© {new Date().getFullYear()} TechStore. All rights reserved.</p>

          <div className="flex gap-5">
            <Link
              to="/privacy-policy"
              className="hover:text-blue-500 transition-colors"
            >
              Bảo mật
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-blue-500 transition-colors"
            >
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
