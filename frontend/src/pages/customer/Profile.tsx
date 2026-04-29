import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Package, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useOrderStore, type OrderHistoryItem, type OrderHistoryOrder } from '@/stores/order.store';

type OrderStatusTab =
  | 'ALL'
  | 'PENDING'
  | 'APPROVED'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED';

const STATUS_LABEL_MAP: Record<OrderStatusTab, string> = {
  ALL: 'Tất cả',
  PENDING: 'Chờ xác nhận',
  APPROVED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const INITIAL_VISIBLE_ORDERS = 10;

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { orders, fetchMyOrders, loading } = useOrderStore();
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('ALL');
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const statusCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = String(order.status || '').toUpperCase() as OrderStatusTab;
        if (status in acc) {
          acc[status] += 1;
        }
        acc.ALL += 1;
        return acc;
      },
      {
        ALL: 0,
        PENDING: 0,
        APPROVED: 0,
        SHIPPING: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      } satisfies Record<OrderStatusTab, number>,
    );
  }, [orders]);

  const displayedOrders = useMemo(() => {
    if (activeTab === 'ALL') {
      return orders;
    }

    return orders.filter(
      (order) => String(order.status || '').toUpperCase() === activeTab,
    );
  }, [activeTab, orders]);

  const visibleOrders = useMemo(() => {
    if (showAllOrders) {
      return displayedOrders;
    }

    return displayedOrders.slice(0, INITIAL_VISIBLE_ORDERS);
  }, [displayedOrders, showAllOrders]);

  const tabs: OrderStatusTab[] = [
    'ALL',
    'PENDING',
    'APPROVED',
    'SHIPPING',
    'COMPLETED',
    'CANCELLED',
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header phần profile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Tài khoản của bạn
          </h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-5 py-2.5 rounded-lg border border-red-200 transition-all shadow-sm hover:shadow"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>

      {/* Card thông tin cá nhân */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.profile?.fullName || user.email || 'Người dùng'}
              </h2>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                <Mail size={16} />
                {user.email}
              </p>
            </div>
          </div>

          {/* Các thông tin bổ sung (có thể mở rộng sau) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <ShieldCheck size={24} className="text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Tài khoản an toàn</h3>
                <p className="text-sm text-gray-600 mt-1">Đã xác thực email</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Clock size={24} className="text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Thành viên từ</h3>
                <p className="text-sm text-gray-600 mt-1">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Lịch sử đơn hàng */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[560px] flex flex-col">
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package size={22} className="text-blue-600" />
              Lịch sử mua hàng
            </h2>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex-1">
          {loading ? (
            <div className="text-center text-gray-500 py-8 animate-pulse min-h-[280px] flex items-center justify-center">
              Đang tải đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-600 min-h-[320px] flex flex-col items-center justify-center">
              <p className="font-medium text-gray-700 text-lg">Bạn chưa có đơn hàng nào</p>
              <Link
                to="/products"
                className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition shadow-sm hover:shadow"
              >
                Bắt đầu mua sắm
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setShowAllOrders(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      activeTab === tab
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {STATUS_LABEL_MAP[tab]} ({statusCounts[tab]})
                  </button>
                ))}
              </div>

              {displayedOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                  Không có đơn nào ở trạng thái {STATUS_LABEL_MAP[activeTab].toLowerCase()}.
                </div>
              ) : visibleOrders.map((order: OrderHistoryOrder) => {
                const items: OrderHistoryItem[] = Array.isArray(order.items)
                  ? order.items
                  : [];
                const status = String(order.status || '').toUpperCase();

                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-5 transition-colors transition-shadow hover:shadow-md cursor-pointer"
                  >
                    {/* Header đơn hàng */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">Mã đơn:</span>
                        <span className="font-semibold text-gray-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <span className="text-lg font-bold text-blue-600">
                        {order.totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {/* Ngày + Trạng thái */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <div className="text-gray-600">
                        {new Date(order.createdAt).toLocaleString('vi-VN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>

                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        status === 'SHIPPING' ? 'bg-blue-100 text-blue-700' :
                        status === 'APPROVED' || status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {STATUS_LABEL_MAP[status as OrderStatusTab] || status}
                      </span>
                    </div>

                    {/* Preview sản phẩm - giữ nguyên như anh đang dùng */}
                    <div className="mt-4 text-sm text-gray-600">
                      {items.slice(0, 2).map((item: OrderHistoryItem) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="line-clamp-1">{item.productName}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div className="text-gray-500 mt-1">
                          + {items.length - 2} sản phẩm khác
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {displayedOrders.length > INITIAL_VISIBLE_ORDERS && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllOrders((prev) => !prev)}
                    className="px-5 py-2 rounded-lg border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition"
                  >
                    {showAllOrders
                      ? 'Thu gọn danh sách'
                      : `Xem thêm ${displayedOrders.length - INITIAL_VISIBLE_ORDERS} đơn hàng`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}