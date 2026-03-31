import { useCartStore } from '@/store/cart.store';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, ShieldCheck, Lock } from 'lucide-react';
import { useOrderStore } from '@/store/order.store';

export default function CheckoutPage() {
  const { items, clearCart, removeFromCart } = useCartStore();
  const createOrder = useOrderStore((state) => state.createOrder);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'COD' as 'COD' | 'BANK_TRANSFER',
  });

  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;

  const handleSubmit = async () => {
    if (!items.length) {
      toast.error('Giỏ hàng trống');
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        paymentMethod: form.paymentMethod,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await createOrder(payload);

      if (res.requiresPayment && res.paymentUrl) {
        toast.success('Đang chuyển sang cổng thanh toán VNPAY...');
        window.location.href = res.paymentUrl;
        return;
      }

      clearCart();
      toast.success('Đặt hàng thành công 🎉');
      navigate(`/order-success/${res.order.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi đặt hàng';

      // If a product was deleted in admin while still in cart, remove it locally.
      const notFoundPattern = /^Sản phẩm\s+([a-f0-9-]{36})\s+không tồn tại$/i;
      const match = message.match(notFoundPattern);

      if (match?.[1]) {
        removeFromCart(match[1]);
        toast.error('Một sản phẩm trong giỏ đã bị xóa khỏi hệ thống. Đã cập nhật lại giỏ hàng.');
        return;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[90vh]">
      {/* Back link */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Cart
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10 tracking-tight">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* ==================== LEFT: SHIPPING INFORMATION ==================== */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={22} className="text-blue-600" />
                Shipping Information
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ tên người nhận
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Hoàng Phú"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0123 456 789"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ giao hàng
                </label>
                <input
                  type="text"
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={form.paymentMethod === 'COD'}
                      onChange={() => setForm({ ...form, paymentMethod: 'COD' })}
                    />
                    <span className="text-sm text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                  </label>

                  <label className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={form.paymentMethod === 'BANK_TRANSFER'}
                      onChange={() =>
                        setForm({ ...form, paymentMethod: 'BANK_TRANSFER' })
                      }
                    />
                    <span className="text-sm text-gray-800">Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT: ORDER SUMMARY ==================== */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>{total.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Nút đặt hàng */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-70 ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              <Lock size={18} />
              {loading ? 'Đang xử lý...' : `Place Order - ${total.toLocaleString('vi-VN')} đ`}
            </button>

            {/* Secure badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 py-3 rounded-lg">
              <ShieldCheck size={18} />
              Secure SSL encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}