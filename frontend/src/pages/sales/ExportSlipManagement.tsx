import { FileText, Plus, Pencil, Trash2, Eye, Package, CheckCircle2, TrendingUp } from "lucide-react";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
import { AppModal } from "@/components/common/AppModal";
import { InlineLoading, TableLoadingRow } from "@/components/common/Loading";
import { StockOutStatus, StockOutType } from "@/types/stockOut.types";
import { useExportSlipPage } from "@/hooks/useExportSlipPage";
import { formatCurrencyVnd } from "@/utils/format";

const statusBadgeClass: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
};

const typeLabel: Record<string, string> = {
  SALE: "Bán hàng",
  INTERNAL: "Nội bộ",
  TRANSFER: "Điều chuyển",
};

export default function ExportSlipManagement() {
  const {
    productOptions,
    isLoading,
    isLoadingProducts,
    isSubmitting,
    formOpen,
    detailOpen,
    editingId,
    selectedStockOut,
    type,
    filterStatus,
    filterType,
    filterMonth,
    monthOptions,
    exportStats,
    items,
    totalAmount,
    table,
    setType,
    setFilterStatus,
    setFilterType,
    setFilterMonth,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openDetailModal,
    closeDetailModal,
    addItem,
    removeItem,
    updateItem,
    submitForm,
    removeStockOut,
  } = useExportSlipPage();

  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={6} text="Đang tải dữ liệu phiếu xuất..." />;

    if (table.pagedData.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📄</span>
              <p className="font-medium text-gray-600">Chưa có phiếu xuất nào.</p>
              <p className="text-sm">Hãy thử thêm phiếu mới hoặc thay đổi bộ lọc.</p>
            </div>
          </td>
        </tr>
      );
    }

    return table.pagedData.map((stockOut) => (
      <tr key={stockOut.id} className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40">
        <td className="px-6 py-4 font-mono text-gray-900 font-bold">
          <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 shadow-sm text-xs">
            #{stockOut.id.slice(0, 8).toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4 font-medium text-gray-800">
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-200 shadow-sm">
            {typeLabel[stockOut.type] ?? stockOut.type}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-500 font-medium">
          {new Date(stockOut.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })}
        </td>
        <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">
          {formatCurrencyVnd(stockOut.totalAmount)}
        </td>
        <td className="px-6 py-4 text-center">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${statusBadgeClass[stockOut.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
          >
            {stockOut.status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => openDetailModal(stockOut.id)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Xem chi tiết"
            >
              <Eye size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => openEditModal(stockOut)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 active:scale-95"
              title="Sửa phiếu xuất"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => removeStockOut(stockOut.id)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95"
              title="Xóa phiếu xuất"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <FileText size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Phiếu xuất hàng</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý các phiếu xuất kho (Bán hàng, Nội bộ, Điều chuyển)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-10 min-w-[120px] px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              <option value="">Tất cả tháng</option>
              {monthOptions.map((key) => {
                const [year, month] = key.split("-");
                return (
                  <option key={key} value={key}>
                    Tháng {parseInt(month)}/{year}
                  </option>
                );
              })}
            </select>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} /> Tạo phiếu xuất
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-blue-100/50">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng phiếu xuất</p>
              <p className="text-2xl font-bold text-gray-900">{exportStats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
              <Package className="text-blue-600" size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-emerald-100/50">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{exportStats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="text-emerald-600" size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-violet-100/50">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng giá trị xuất</p>
              <p className="text-2xl font-bold text-gray-900 truncate text-violet-700">
                {formatCurrencyVnd(exportStats.totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-inner">
              <TrendingUp className="text-violet-600" size={22} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 bg-white flex flex-wrap gap-3 items-center">
            <DataTableToolbar
              searchValue={table.searchTerm}
              onSearchChange={table.setSearchTerm}
              searchPlaceholder="Tìm theo mã phiếu..."
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={StockOutStatus.PENDING}>Chờ duyệt (PENDING)</option>
              <option value={StockOutStatus.COMPLETED}>Hoàn thành (COMPLETED)</option>
              <option value={StockOutStatus.CANCELLED}>Đã hủy (CANCELLED)</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-3 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer transition-all"
            >
              <option value="">Tất cả loại phiếu</option>
              <option value={StockOutType.SALE}>Bán hàng</option>
              <option value={StockOutType.INTERNAL}>Nội bộ</option>
              <option value={StockOutType.TRANSFER}>Điều chuyển</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Mã phiếu</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Loại phiếu</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Ngày tạo</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Tổng tiền</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Trạng thái</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={table.meta}
              currentPage={table.page}
              isLoading={isLoading}
              onPageChange={table.setPage}
            />
          </div>
        </div>
      </div>

      <AppModal
        isOpen={formOpen}
        onClose={closeFormModal}
        title={editingId ? "Cập nhật phiếu xuất" : "Tạo phiếu xuất hàng"}
        maxWidthClassName="max-w-2xl"
      >
        <form onSubmit={submitForm} className="p-6 space-y-5 bg-white">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Loại phiếu xuất <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as keyof typeof StockOutType)
              }
              className="w-full h-11 px-4 text-sm font-medium border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors cursor-pointer"
            >
              <option value={StockOutType.SALE}>Bán hàng</option>
              <option value={StockOutType.INTERNAL}>Nội bộ</option>
              <option value={StockOutType.TRANSFER}>Điều chuyển</option>
            </select>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
                Sản phẩm xuất <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition-colors"
              >
                <Plus size={14} strokeWidth={3} /> Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={item._uid}
                  className="grid grid-cols-[1fr_96px_128px_auto] gap-2 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100"
                >
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    required
                    className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {productOptions.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Tồn: {product.stockQuantity})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, "quantity", Number(e.target.value))
                    }
                    placeholder="SL"
                    required
                    className="h-10 px-2 text-sm border border-gray-200 rounded-lg text-center bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />

                  <input
                    type="number"
                    min={0}
                    step="1000"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(i, "price", Number(e.target.value))
                    }
                    placeholder="Đơn giá"
                    required
                    className="h-10 px-2 text-sm border border-gray-200 rounded-lg text-right bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Tổng giá trị xuất
            </span>
            <span className="text-xl font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
              {formatCurrencyVnd(totalAmount)}
            </span>
          </div>

          {isLoadingProducts && (
            <InlineLoading
              text="Đang tải danh sách sản phẩm..."
              className="justify-start text-xs text-gray-500"
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting
                ? "Đang lưu..."
                : editingId
                  ? "Lưu thay đổi"
                  : "Tạo phiếu xuất"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        isOpen={detailOpen}
        onClose={closeDetailModal}
        title="Chi tiết phiếu xuất"
        maxWidthClassName="max-w-2xl"
      >
        {selectedStockOut && (
          <div className="p-6 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Mã phiếu</div>
                <div className="font-bold text-gray-900 font-mono">
                  #{selectedStockOut.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Loại phiếu</div>
                <div className="font-bold text-gray-900">
                  <span className="inline-flex items-center rounded-md bg-white px-2.5 py-0.5 text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm">
                    {typeLabel[selectedStockOut.type] ?? selectedStockOut.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3 text-center">SL</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedStockOut.details.map((detail) => (
                    <tr key={detail.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {detail.product?.name ?? detail.productId}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">
                        {detail.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatCurrencyVnd(detail.price)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatCurrencyVnd(detail.price * detail.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
              <span className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mr-4">
                Tổng cộng
              </span>
              <span className="text-2xl font-bold text-blue-700">
                {formatCurrencyVnd(selectedStockOut.totalAmount)}
              </span>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
