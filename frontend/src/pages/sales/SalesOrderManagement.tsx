import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useSalesStore } from "@/stores/sales.store";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
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
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  SHIPPING: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n || 0,
  );

const formatPaymentMethod = (method?: string) => {
  if (method === "COD") return "COD";
  if (method === "BANK_TRANSFER") return "Chuyển khoản";
  return method || "—";
};

export default function SalesOrderManagement() {
  const { orders, isLoading, fetchOrders, updateOrderStatus } = useSalesStore();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } =
    useClientTable({
      data: orders,
      pageSize: 10,
      searchFn: (order, keyword) => {
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
      },
    });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (
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
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={28} /> Quản lý đơn
            hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xác nhận và cập nhật trạng thái đơn hàng từ khách
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Mã đơn</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">SĐT</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">PT thanh toán</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : pagedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  pagedData.map((o) => {
                    const status = String(
                      o.status,
                    ).toUpperCase() as AdminOrderStatus;
                    const badgeClass =
                      STATUS_BADGE_CLASS[status] ?? "bg-gray-100 text-gray-700";

                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-gray-900">
                          {o.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {o.fullName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{o.phone}</td>
                        <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-700 truncate max-w-55"
                          title={o.items?.map((i) => i.productName).join(", ")}
                        >
                          {o.items?.slice(0, 2).map((item, index) => (
                            <span key={item.id}>
                              {item.productName}
                              {index < Math.min(o.items.length, 2) - 1 && ", "}
                            </span>
                          ))}

                          {o.items && o.items.length > 2 && (
                            <span className="text-gray-400">
                              {" "}
                              +{o.items.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatPaymentMethod(o.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}
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
                              className="h-8 px-2 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
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
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={meta}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
