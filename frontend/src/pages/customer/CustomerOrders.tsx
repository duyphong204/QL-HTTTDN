import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useOrderStore, type OrderHistoryOrder } from '@/store/order.store';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowRight } from 'lucide-react';

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

export default function CustomerOrders() {
  const { orders, fetchMyOrders, loading } = useOrderStore();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isDetailView = Boolean(id);

  const filteredOrders = useMemo(() => {
    if (!id) {
      return orders;
    }

    return orders.filter((order) => order.id === id);
  }, [id, orders]);

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
        {filteredOrders.map((order: OrderHistoryOrder) => (
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

            {/* Danh sách sản phẩm trong đơn */}
            <div className="p-6 sm:p-8">
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
                </>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}