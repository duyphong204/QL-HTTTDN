import { useEffect } from "react";
import { useCartStore } from "@/stores/cart.store";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProductStore } from "@/stores/product.store";
import { getEffectiveProductPrice } from "@/lib/pricing";
import { useMemo } from "react";

export default function Cart() {
  const { items, increase, decrease, removeFromCart } = useCartStore();
  const { categories, fetchCategories } = useProductStore();

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + getEffectiveProductPrice(item) * item.quantity,
        0,
      ),
    [items],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Phần giỏ hàng rỗng - Đã thiết kế lại đẹp hơn
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12 text-center space-y-8 animate-fade-in">
          {/* Icon giỏ hàng lớn + animation */}
          <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse-slow opacity-30"></div>
            <ShoppingCart
              size={80}
              className="text-blue-600 relative z-10 animate-bounce-slow"
              strokeWidth={1.2}
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Giỏ hàng của bạn đang trống
          </h2>

          <p className="text-gray-600 max-w-xl mx-auto">
            Hãy thêm sản phẩm yêu thích vào giỏ để tiến hành thanh toán nhanh
            hơn.
          </p>

          {/* Nút CTA nổi bật */}
          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Bắt đầu mua sắm ngay
          </Link>

          {/* Gợi ý nhỏ + link nhanh (tùy chọn) */}
          <div className="mt-10 text-sm text-gray-500">
            <p>Các danh mục phổ biến</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categories.length > 0 ? (
                categories.slice(0, 4).map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?categoryId=${category.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <Link
                  to="/products"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Xem tất cả sản phẩm
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phần giỏ hàng có sản phẩm - Giữ nguyên 100%
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-110px)] animate-in fade-in duration-500">
      {/* Tiêu đề + Back */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Giỏ hàng</h1>
          <p className="text-gray-500 font-medium mt-2">Xem lại các sản phẩm bạn đã chọn</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Tiếp tục mua sắm
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm - chiếm 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                {items.length} sản phẩm
              </h2>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 border-b border-gray-200 last:border-b-0 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-gray-50 transition"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-32 h-32 sm:w-28 sm:h-28 flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 p-2 shadow-sm">
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                </div>

                {/* Thông tin */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Sản phẩm</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 w-full">
                    <div className="flex items-center border-2 border-gray-100 rounded-xl bg-white shrink-0 h-10">
                      <button
                        onClick={() => decrease(item.id)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-all active:scale-95"
                      >
                        <Minus size={16} strokeWidth={2.5} />
                      </button>
                      <span className="w-10 text-center font-bold text-gray-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increase(item.id)}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 ml-0 sm:ml-auto">
                      <p className="text-lg font-bold text-blue-600">
                        {(
                          getEffectiveProductPrice(item) *
                          item.quantity
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </p>
                      {typeof item.salePrice === "number" &&
                      item.salePrice < item.price ? (
                        <div className="text-sm">
                          <p className="text-red-600 font-medium">
                            {item.salePrice.toLocaleString("vi-VN")} đ/cái
                          </p>
                          <p className="text-gray-400 line-through">
                            {item.price.toLocaleString("vi-VN")} đ/cái
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {item.price.toLocaleString("vi-VN")} đ/cái
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary - bên phải */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 sticky top-28">
            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Tạm tính</span>
                <span className="font-bold text-gray-900 tabular-nums">
                  {totalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Miễn phí</span>
              </div>
              <div className="border-t-2 border-gray-100 pt-6 mt-4 flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                <span className="text-3xl font-black text-blue-600 tabular-nums">{totalPrice.toLocaleString("vi-VN")} <span className="text-lg text-blue-600/70">đ</span></span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-center text-lg"
              >
                Tiến hành thanh toán
              </Link>

              <Link
                to="/products"
                className="w-full bg-white hover:bg-gray-50 active:scale-95 text-gray-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center border-2 border-gray-200"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            <div className="mt-8 space-y-3 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2.5">
                <Truck size={18} className="text-emerald-500" />
                <span>Đổi trả miễn phí trong vòng 30 ngày</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span>Thanh toán bảo mật an toàn 100%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw size={18} className="text-emerald-500" />
                <span>Bảo hành chính hãng 2 năm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
