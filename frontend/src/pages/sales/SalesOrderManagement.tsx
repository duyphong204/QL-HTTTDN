import { useEffect, useState, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { useSalesStore } from "@/stores/sales.store";
import type { Order } from "@/types/order.types";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableLoadingRow } from "@/components/common/Loading";
import { useClientTable } from "@/hooks/useClientTable";

type AdminOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

const STATUS_LABEL: Record<AdminOrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  APPROVED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_BADGE_CLASS: Record<AdminOrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  APPROVED: "bg-blue-50 text-blue-600 border-blue-100",
  SHIPPING: "bg-indigo-50 text-indigo-600 border-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n || 0,
  );

const formatPaymentMethod = (method?: string) => {
  if (method === "COD") return "Thanh toán khi nhận hàng (COD)";
  if (method === "BANK_TRANSFER") return "Chuyển khoản ngân hàng";
  return method || "—";
};

export default function SalesOrderManagement() {
  const { orders, isLoading, fetchOrders, updateOrderStatus } = useSalesStore();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } =
    useClientTable({
      data: orders,
      pageSize: 10,
      searchFn: useCallback((order: Order, keyword: string) => {
        const orderCode = order.id.slice(0, 8).toLowerCase();
        const customerName = (order.customerName || "").toLowerCase();
        const receiverName = (order.fullName || "").toLowerCase();
        const phone = (order.phone || "").toLowerCase();
        return (
          orderCode.includes(keyword) ||
          customerName.includes(keyword) ||
          receiverName.includes(keyword) ||
          phone.includes(keyword)
        );
      }, []),
    });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = useCallback(async (
    orderId: string,
    nextStatus: AdminOrderStatus,
  ) => {
    if (nextStatus === "PENDING") {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingOrderId(null);
    }
  }, [updateOrderStatus]);

  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={8} text="Đang tải dữ liệu đơn hàng..." />;

    if (pagedData.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🛒</span>
              <p className="font-medium text-gray-600">Chưa có đơn hàng nào.</p>
              <p className="text-sm">Hãy thử thay đổi từ khóa tìm kiếm.</p>
            </div>
          </td>
        </tr>
      );
    }

    return pagedData.map((o) => {
      const status = String(o.status).toUpperCase() as AdminOrderStatus;
      const badgeClass = STATUS_BADGE_CLASS[status] ?? "bg-gray-50 text-gray-700 border-gray-200";

      return (
        <tr
          key={o.id}
          className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
        >
          <td className="px-6 py-4 font-mono text-gray-900 font-bold">
            <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 shadow-sm text-xs">
              #{o.id.slice(0, 8).toUpperCase()}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="font-semibold text-gray-900">{o.fullName}</div>
          </td>
          <td className="px-6 py-4 text-gray-600 font-medium">{o.phone}</td>
          <td className="px-6 py-4">
            <div
              className="text-xs text-gray-600 truncate max-w-[200px]"
              title={o.items?.map((i) => i.productName).join(", ")}
            >
              {o.items?.slice(0, 2).map((item, index) => (
                <span key={item.id} className="font-medium">
                  {item.productName}
                  {index < Math.min(o.items.length, 2) - 1 && ", "}
                </span>
              ))}

              {o.items && o.items.length > 2 && (
                <span className="text-blue-500 font-bold ml-1">
                  +{o.items.length - 2} sp
                </span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 text-gray-500 font-medium">
            {new Date(o.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })}
          </td>
          <td className="px-6 py-4">
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 border border-gray-200 shadow-sm">
              {formatPaymentMethod(o.paymentMethod)}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <span className="font-bold text-gray-900 text-base">
              {formatCurrency(o.totalAmount)}
            </span>
          </td>
          <td className="px-6 py-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border uppercase tracking-wider ${badgeClass}`}
              >
                {STATUS_LABEL[status] ?? status}
              </span>
              <select
                value={status}
                disabled={
                  updatingOrderId === o.id ||
                  status === "COMPLETED" ||
                  status === "CANCELLED"
                }
                onChange={(e) =>
                  handleStatusChange(
                    o.id,
                    e.target.value as AdminOrderStatus,
                  )
                }
                className="h-8 px-2 text-xs font-medium border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-100/50 disabled:text-gray-400 disabled:border-transparent opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <option value="PENDING">Chờ xác nhận</option>
                <option value="APPROVED">Đã xác nhận</option>
                <option value="SHIPPING">Đang giao</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <ShoppingCart size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý đơn hàng</h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi, xác nhận và cập nhật trạng thái đơn hàng từ khách
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Mã đơn</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Khách hàng</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">SĐT</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Sản phẩm</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Ngày tạo</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Thanh toán</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Tổng tiền</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={page}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
