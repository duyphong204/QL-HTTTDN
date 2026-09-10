import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="min-h-[80vh] bg-slate-50/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-green-900/5 overflow-hidden border border-gray-100">
        {/* Header thành công */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 px-8 py-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-20 transform -skew-y-12"></div>
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10 border border-white/30">
            <CheckCircle size={56} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight relative z-10 drop-shadow-sm">
            ĐẶT HÀNG THÀNH CÔNG!
          </h1>
          <p className="mt-4 text-lg font-medium text-emerald-50 relative z-10">
            Cảm ơn quý khách đã tin tưởng mua sắm tại TechStore 🎉
          </p>
        </div>

        {/* Nội dung chính */}
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10 bg-blue-50/50 py-6 rounded-2xl border border-blue-100">
            <p className="text-lg font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Mã đơn hàng của bạn
            </p>
            <p className="text-3xl font-black text-blue-600 tracking-tight">#{id}</p>
            <p className="mt-4 text-sm font-medium text-gray-500">
              Chúng tôi đã nhận được đơn hàng và đang chờ admin xác nhận trước khi giao.
            </p>
          </div>

          {/* Các thông tin trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Truck size={28} strokeWidth={2} />
              </div>
              <h3 className="font-bold text-gray-900">Giao hàng siêu tốc</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-2">Từ 2-4 ngày làm việc</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <ShieldCheck size={28} strokeWidth={2} />
              </div>
              <h3 className="font-bold text-gray-900">Bảo mật tuyệt đối</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-2">
                Thanh toán mã hóa SSL
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <Package size={28} strokeWidth={2} />
              </div>
              <h3 className="font-bold text-gray-900">Dễ dàng theo dõi</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-2">
                Cập nhật qua Email
              </p>
            </div>
          </div>

          {/* Hành động tiếp theo */}
          <div className="text-center space-y-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30"
            >
              Tiếp tục mua sắm
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>

            <p className="text-sm font-medium text-gray-400">
              Cần hỗ trợ? <Link to="/contact" className="text-blue-600 hover:underline">Liên hệ bộ phận CSKH</Link>
            </p>
          </div>
        </div>

        {/* Footer nhỏ */}
        <div className="bg-gray-50/80 px-8 py-6 text-center text-[13px] font-medium text-gray-500 border-t border-gray-100">
          © {new Date().getFullYear()} TechStore. All rights reserved.
        </div>
      </div>
    </div>
  );
}
