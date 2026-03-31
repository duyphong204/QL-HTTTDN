import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Truck, ShieldCheck } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header thành công */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="mt-3 text-lg text-green-100">
            Cảm ơn anh Phú đã tin tưởng TechStore 🎉
          </p>
        </div>

        {/* Nội dung chính */}
        <div className="p-8 sm:p-10">
          <div className="text-center mb-10">
            <p className="text-xl font-semibold text-gray-900">
              Mã đơn hàng của anh: <span className="text-blue-600">#{id}</span>
            </p>
            <p className="mt-2 text-gray-600">
              Chúng tôi đã nhận được đơn hàng. Đơn đang chờ admin xác nhận trước khi giao.
            </p>
          </div>

          {/* Các thông tin trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
              <Truck size={32} className="mx-auto text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-900">Giao hàng nhanh</h3>
              <p className="text-sm text-gray-600 mt-1">2-4 ngày làm việc</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
              <ShieldCheck size={32} className="mx-auto text-green-600 mb-3" />
              <h3 className="font-medium text-gray-900">An toàn & Bảo mật</h3>
              <p className="text-sm text-gray-600 mt-1">Thanh toán SSL mã hóa</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
              <Package size={32} className="mx-auto text-purple-600 mb-3" />
              <h3 className="font-medium text-gray-900">Theo dõi đơn hàng</h3>
              <p className="text-sm text-gray-600 mt-1">Sẽ gửi email cập nhật</p>
            </div>
          </div>

          {/* Hành động tiếp theo */}
          <div className="text-center space-y-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-md hover:shadow-lg"
            >
              Tiếp tục mua sắm
              <ArrowRight size={18} />
            </Link>

            <p className="text-sm text-gray-500">
              Cần hỗ trợ? Liên hệ chúng tôi qua email hoặc hotline.
            </p>
          </div>
        </div>

        {/* Footer nhỏ */}
        <div className="bg-gray-50 px-8 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
          © {new Date().getFullYear()} TechStore. All rights reserved.
        </div>
      </div>
    </div>
  );
}