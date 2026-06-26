import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Mail, Package, ShieldCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  useOrderStore,
  type OrderHistoryItem,
  type OrderHistoryOrder,
} from "@/stores/order.store";

type OrderStatusTab =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

const STATUS_LABEL_MAP: Record<OrderStatusTab, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ xác nhận",
  APPROVED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const INITIAL_VISIBLE_ORDERS = 10;

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { orders, fetchMyOrders, loading } = useOrderStore();
  const [activeTab, setActiveTab] = useState<OrderStatusTab>("ALL");
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const statusCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        const status = String(
          order.status || "",
        ).toUpperCase() as OrderStatusTab;
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
    if (activeTab === "ALL") {
      return orders;
    }

    return orders.filter(
      (order) => String(order.status || "").toUpperCase() === activeTab,
    );
  }, [activeTab, orders]);

  const visibleOrders = useMemo(() => {
    if (showAllOrders) {
      return displayedOrders;
    }

    return displayedOrders.slice(0, INITIAL_VISIBLE_ORDERS);
  }, [displayedOrders, showAllOrders]);

  const tabs: OrderStatusTab[] = [
    "ALL",
    "PENDING",
    "APPROVED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED",
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">
          Đang tải thông tin...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-in fade-in duration-500">
      {/* Header phần profile */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            Tài khoản của bạn
          </h1>
          <p className="text-gray-500 text-lg mt-3 font-medium">
            Quản lý thông tin cá nhân và theo dõi đơn hàng
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold px-6 py-3 rounded-xl border border-red-100 hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card thông tin cá nhân */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] shadow-2xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
            
            <div className="p-8 relative z-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border-4 border-white/30 mb-4 shadow-inner">
                  <User size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">
                  {user.profile?.fullName || user.email || "Người dùng"}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-blue-100 border border-white/10">
                  <Mail size={14} />
                  <span className="truncate max-w-[150px]">{user.email}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-50 text-sm">Bảo mật</h3>
                    <p className="text-xs text-blue-200 mt-0.5">Đã xác thực Email</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-50 text-sm">Thành viên từ</h3>
                    <p className="text-xs text-blue-200 mt-0.5">
                      Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử đơn hàng */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-[560px]">
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

        <div className="p-6 sm:p-8 flex-1 bg-gray-50/30">
          {loading ? (
            <div className="text-center text-gray-500 py-8 animate-pulse min-h-[280px] flex items-center justify-center">
              Đang tải đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-600 min-h-[320px] flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-900 text-xl">
                Chưa có đơn hàng nào
              </p>
              <p className="text-gray-500 mt-2 mb-8">
                Hãy khám phá các sản phẩm tuyệt vời của chúng tôi
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95"
              >
                Bắt đầu mua sắm
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 -mx-2 px-2 snap-x">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        setShowAllOrders(false);
                      }}
                      className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all snap-start ${
                        activeTab === tab
                          ? "bg-gray-900 border-gray-900 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {STATUS_LABEL_MAP[tab]} <span className={activeTab === tab ? "text-gray-400 font-normal ml-1" : "text-gray-400 font-normal ml-1"}>({statusCounts[tab]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {displayedOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                  Không có đơn nào ở trạng thái{" "}
                  {STATUS_LABEL_MAP[activeTab].toLowerCase()}.
                </div>
              ) : (
                visibleOrders.map((order: OrderHistoryOrder) => {
                  const items: OrderHistoryItem[] = Array.isArray(order.items)
                    ? order.items
                    : [];
                  const status = String(order.status || "").toUpperCase();

                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-5 transition-colors transition-shadow hover:shadow-md cursor-pointer"
                    >
                      {/* Header đơn hàng */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            #{order.id.slice(0, 4).toUpperCase()}
                          </span>
                          <span className="font-bold text-gray-900 text-lg">
                            Mã: {order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <span className="text-xl font-black text-blue-600 tabular-nums">
                          {order.totalAmount.toLocaleString("vi-VN")} <span className="text-sm text-blue-600/70">đ</span>
                        </span>
                      </div>

                      {/* Ngày + Trạng thái */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <div className="text-gray-600">
                          {new Date(order.createdAt).toLocaleString("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : status === "SHIPPING"
                                ? "bg-blue-100 text-blue-700"
                                : status === "APPROVED" || status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : status === "CANCELLED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_LABEL_MAP[status as OrderStatusTab] || status}
                        </span>
                      </div>

                      {/* Preview sản phẩm - giữ nguyên như anh đang dùng */}
                      <div className="mt-4 text-sm text-gray-600">
                        {items.slice(0, 2).map((item: OrderHistoryItem) => (
                          <div key={item.id} className="flex justify-between">
                            <span className="line-clamp-1">
                              {item.productName}
                            </span>
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
                })
              )}

              {displayedOrders.length > INITIAL_VISIBLE_ORDERS && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllOrders((prev) => !prev)}
                    className="px-5 py-2 rounded-lg border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition"
                  >
                    {showAllOrders
                      ? "Thu gọn danh sách"
                      : `Xem thêm ${displayedOrders.length - INITIAL_VISIBLE_ORDERS} đơn hàng`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
