import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, LoaderCircle, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useOrderStore } from "@/stores/order.store";

type VerifyState =
  | { status: "loading" }
  | { status: "success"; orderId: string; message: string }
  | { status: "error"; message: string };

export default function PaymentReturn() {
  const location = useLocation();
  const [state, setState] = useState<VerifyState>({ status: "loading" });
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
            status: "success",
            orderId: res.orderId,
            message: res.message,
          });
          return;
        }

        setState({
          status: "error",
          message: res.message || "Thanh toán thất bại",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Không thể xác thực kết quả thanh toán";
        setState({ status: "error", message });
      }
    };

    verify();
  }, [queryString, clearCart, verifyMomoReturn]);

  if (state.status === "loading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
          <LoaderCircle size={36} className="animate-spin text-blue-600" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Đang xác thực thanh toán...
        </h1>
        <p className="mt-3 text-gray-500 font-medium">Hệ thống đang kết nối với MoMo, vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100 relative">
          <div className="absolute inset-0 border-4 border-emerald-100 rounded-full animate-ping opacity-20"></div>
          <CheckCircle size={48} className="text-emerald-600 relative z-10" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Thanh toán thành công!
        </h1>
        <p className="mt-3 text-gray-500 font-medium max-w-md">
          {state.message}. Đơn hàng của bạn đã được ghi nhận và đang chờ admin xác nhận.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to={`/order-success/${state.orderId}`}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
          >
            Xem đơn hàng
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 text-gray-700 font-bold px-8 py-3.5 rounded-2xl transition-all shadow-sm"
          >
            Lịch sử đơn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
        <XCircle size={48} className="text-red-600" strokeWidth={2.5} />
      </div>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">
        Thanh toán chưa thành công
      </h1>
      <p className="mt-3 text-red-600 font-medium bg-red-50/50 px-4 py-2 rounded-lg border border-red-100 max-w-md">{state.message}</p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          to="/checkout"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
        >
          Thử lại thanh toán
        </Link>
        <Link
          to="/cart"
          className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-95 text-gray-700 font-bold px-8 py-3.5 rounded-2xl transition-all shadow-sm"
        >
          Về giỏ hàng
        </Link>
      </div>
    </div>
  );
}
