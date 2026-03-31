import { useEffect } from 'react';
import { useCartStore } from '@/store/cart.store';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, RefreshCw, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductStore } from '@/store/product.store';

export default function Cart() {
  const { items, increase, decrease, removeFromCart } = useCartStore();
  const { categories, fetchCategories } = useProductStore();

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
            Hãy thêm sản phẩm yêu thích vào giỏ để tiến hành thanh toán nhanh hơn.
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
                <Link to="/products" className="text-blue-600 hover:text-blue-800 hover:underline">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-110px)]">
      {/* Tiêu đề + Back */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng </h1>
        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm - chiếm 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {items.length} items
              </h2>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 border-b border-gray-200 last:border-b-0 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-gray-50 transition"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-32 h-32 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thông tin */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Accessories</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => decrease(item.id)}
                        disabled={item.quantity <= 1}
                        className="px-4 py-2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-6 py-2 font-medium text-gray-900 bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increase(item.id)}
                        className="px-4 py-2 bg-white hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right ml-auto">
                      <p className="text-lg font-bold text-blue-600">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString('vi-VN')} đ/cái
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary - bên phải */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-center"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-8 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-green-600" />
                <span>Free returns within 30 days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-600" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className="text-green-600" />
                <span>2-year warranty included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}