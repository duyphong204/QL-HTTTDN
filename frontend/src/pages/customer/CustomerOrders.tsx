import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useOrderStore, type OrderHistoryOrder } from '@/stores/order.store';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowRight, MapPin, Phone, CreditCard, Calendar } from 'lucide-react';
import { toast } from 'sonner';

type OrderDetailFallback = {
  id?: string;
  productId?: string;
  quantity?: number;
  price?: number;
  product?: {
    name?: string;
    imageUrl?: string;
  };
};

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

const STATUS_TABS: OrderStatusTab[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
];

export default function CustomerOrders() {
  const { orders, fetchMyOrders, loading, retryOrderPayment } = useOrderStore();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('ALL');
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const isDetailView = Boolean(id);

  const filteredOrders = useMemo(() => {
    if (!id) {
      return orders;
    }

    return orders.filter((order) => order.id === id);
  }, [id, orders]);

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

  const visibleOrders = useMemo(() => {
    if (isDetailView) {
      return filteredOrders;
    }

    if (activeTab === 'ALL') {
      return filteredOrders;
    }

    return filteredOrders.filter(
      (order) => String(order.status || '').toUpperCase() === activeTab,
    );
  }, [activeTab, filteredOrders, isDetailView]);

  useEffect(() => {
    if (!orders.length) {
      fetchMyOrders();
    }
  }, [fetchMyOrders, orders.length]);

  useLayoutEffect(() => {
    if (isDetailView) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [isDetailView, id]);

  const handleRetryPayment = async (orderId: string) => {
    try {
      setRetryingOrderId(orderId);
      const response = await retryOrderPayment(orderId);

      if (response.requiresPayment && response.paymentUrl) {
        toast.success('Đang chuyển sang cổng thanh toán MoMo...');
        window.location.href = response.paymentUrl;
        return;
      }

      toast.error('Không lấy được liên kết thanh toán');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể thanh toán lại đơn hàng';
      toast.error(message);
    } finally {
      setRetryingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 min-h-[calc(100vh-220px)]">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Lịch sử đơn hàng</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center min-h-[calc(100vh-220px)] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Bạn chưa có đơn hàng nào</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Khi bạn đặt hàng, lịch sử sẽ hiển thị ở đây để dễ dàng theo dõi.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-md hover:shadow-lg"
        >
          Bắt đầu mua sắm
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isDetailView && !filteredOrders.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 min-h-[calc(100vh-220px)] flex items-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng bạn chọn không tồn tại hoặc không thuộc tài khoản này.</p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Quay lại trang hồ sơ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between gap-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          {isDetailView ? 'Chi tiết đơn hàng' : 'Lịch sử đơn hàng'}
        </h1>
        {isDetailView && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Quay lại danh sách 
          </button>
        )}
      </div>

      <div className="space-y-6">
        {!isDetailView ? (
          <div className="flex flex-wrap gap-3 pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  activeTab === tab
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {STATUS_LABEL_MAP[tab]} ({statusCounts[tab]})
              </button>
            ))}
          </div>
        ) : null}

        {!isDetailView && visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
            Không có đơn nào ở trạng thái {STATUS_LABEL_MAP[activeTab].toLowerCase()}.
          </div>
        ) : null}

        {visibleOrders.map((order: OrderHistoryOrder) => (
          <div
            key={order.id}
            onClick={() => {
              if (!isDetailView) {
                navigate(`/orders/${order.id}`);
              }
            }}
            className={`block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all group ${
              isDetailView ? '' : 'hover:shadow-md hover:border-blue-200 cursor-pointer'
            }`}
          >
            {(() => {
              const fallbackDetails = (
                order as OrderHistoryOrder & { details?: OrderDetailFallback[] }
              ).details;

              const normalizedItems = Array.isArray(order.items) && order.items.length > 0
                ? order.items
                : Array.isArray(fallbackDetails)
                  ? fallbackDetails.map((d, idx) => ({
                      id: d.id ?? `${order.id}-${idx}`,
                      productId: d.productId ?? '',
                      productName: d.product?.name ?? 'Sản phẩm',
                      quantity: d.quantity ?? 0,
                      price: d.price ?? 0,
                      imageUrl: d.product?.imageUrl,
                    }))
                  : [];

              const status = String(order.status || '').toUpperCase();
              const paymentStatus = String(order.paymentStatus || '').toUpperCase();
              const productSubtotal = normalizedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

              return (
                <>
            {/* Header đơn hàng */}
            <div className="p-6 sm:p-8 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Mã đơn:</span>
                  <span className="font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString('vi-VN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
                  status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  status === 'SHIPPING' ? 'bg-blue-100 text-blue-700' :
                  status === 'APPROVED' || status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {status === 'COMPLETED' && <CheckCircle size={16} />}
                  {status === 'SHIPPING' && <Truck size={16} />}
                  {(status === 'APPROVED' || status === 'PENDING') && <Clock size={16} />}
                  {status === 'CANCELLED' && <XCircle size={16} />}
                  {status || 'UNKNOWN'}
                </span>

                <span className="text-xl font-bold text-blue-600">
                  {order.totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Thông tin chi tiết - hiện khi ở detail view */}
            {isDetailView && (
              <div className="p-6 sm:p-8 border-b border-gray-200 space-y-6">
                {/* Thông tin giao hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Địa chỉ giao hàng</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className=" text-gray-900">Tên người nhận: {order.fullName}</p>
                      <p className="text-gray-700">Địa chỉ: {order.address}</p>
                      <div className="flex items-center gap-2 text-gray-700 pt-2">
                        <Phone size={14} />
                        {order.phone}
                      </div>
                    </div>
                  </div>

                  {/* Thông tin thanh toán */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Phương thức thanh toán</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hình thức:</span>
                        <span className="font-medium text-gray-900">
                          {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                           order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : order.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                          paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {paymentStatus === 'PAID' ? 'Đã thanh toán' :
                           paymentStatus === 'PENDING' ? 'Chờ thanh toán' : paymentStatus}
                        </span>
                      </div>

                      {order.paymentMethod === 'BANK_TRANSFER' &&
                      paymentStatus !== 'PAID' &&
                      status !== 'CANCELLED' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleRetryPayment(order.id);
                          }}
                          disabled={retryingOrderId === order.id}
                          className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {retryingOrderId === order.id ? 'Đang tạo link thanh toán...' : 'Thanh toán lại với MoMo'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Ngày giờ chi tiết */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Thông tin ngày giờ</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-gray-600">Đặt hàng lúc:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleString('vi-VN', {
                        dateStyle: 'long',
                        timeStyle: 'medium',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Danh sách sản phẩm trong đơn */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-6">Danh sách sản phẩm ({normalizedItems.length})</h3>
              {normalizedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {normalizedItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.productId ? `/products/${item.productId}` : '#'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item.productId) {
                          e.preventDefault();
                        }
                      }}
                      className={`flex gap-4 items-center rounded-lg p-2 -m-2 transition ${
                        item.productId
                          ? 'hover:bg-blue-50'
                          : 'cursor-default pointer-events-none'
                      }`}
                    >
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.imageUrl || `https://via.placeholder.com/150?text=${encodeURIComponent(item.productName.slice(0, 10))}`}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-2">{item.productName}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')} đ
                        </p>
                        <p className="text-sm font-semibold text-blue-600 mt-0.5">
                          Thành tiền: {(item.quantity * item.price).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Không có thông tin sản phẩm</p>
              )}
            </div>

            {/* Tóm tắt chi phí */}
            <div className="p-6 sm:p-8 bg-gray-50 rounded-b-2xl">
              <div className="max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng sản phẩm:</span>
                  <span className="font-medium text-gray-900">{productSubtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-gray-900">0 đ</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}