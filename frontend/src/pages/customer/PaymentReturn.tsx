import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, LoaderCircle, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useOrderStore } from '@/store/order.store';

type VerifyState =
  | { status: 'loading' }
  | { status: 'success'; orderId: string; message: string }
  | { status: 'error'; message: string };

export default function PaymentReturn() {
  const location = useLocation();
  const [state, setState] = useState<VerifyState>({ status: 'loading' });
  const clearCart = useCartStore((s) => s.clearCart);
  const verifyMomoReturn = useOrderStore((s) => s.verifyMomoReturn);

  const queryString = useMemo(() => location.search, [location.search]);

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(queryString);
        const res = await verifyMomoReturn(params);

        if (res.success) {
          await clearCart();
          setState({
            status: 'success',
            orderId: res.orderId,
            message: res.message,
          });
          return;
        }

        setState({
          status: 'error',
          message: res.message || 'Thanh toán thất bại',
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Không thể xác thực kết quả thanh toán';
        setState({ status: 'error', message });
      }
    };

    verify();
  }, [queryString, clearCart, verifyMomoReturn]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <LoaderCircle size={42} className="animate-spin text-blue-600" />
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Đang xác thực thanh toán...</h1>
        <p className="mt-2 text-gray-600">Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <CheckCircle size={52} className="text-green-600" />
        <h1 className="mt-5 text-3xl font-bold text-gray-900">Thanh toán thành công</h1>
        <p className="mt-2 text-gray-600">{state.message}. Đơn hàng đang chờ admin xác nhận.</p>
        <div className="mt-8 flex gap-3">
          <Link
            to={`/order-success/${state.orderId}`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Xem đơn hàng
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-xl transition"
          >
            Lịch sử đơn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <XCircle size={52} className="text-red-600" />
      <h1 className="mt-5 text-3xl font-bold text-gray-900">Thanh toán chưa thành công</h1>
      <p className="mt-2 text-gray-600">{state.message}</p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/checkout"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Thử lại
        </Link>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-xl transition"
        >
          Về giỏ hàng
        </Link>
      </div>
    </div>
  );
}
