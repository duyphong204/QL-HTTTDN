import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Eye, Pencil, Package, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { TableLoadingRow } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import { AppModal } from "@/components/common/AppModal";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useClientTable } from "@/hooks/useClientTable";
import { useStockInStore } from "@/stores/stockIn.store";
import { cn } from "@/lib/utils";
import { formatNumberWithDong } from "@/utils/format";
import type { StockIn } from "@/types/stockIn.types";
import ImportSlipFormModal from "./ImportSlipFormModal";

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
};

export default function ImportSlipManagement() {
  const { confirmAndRun } = useConfirmAction();

  // ================= STORE STATE =================
  const stockIns = useStockInStore((state) => state.stockIns);
  const selectedStockIn = useStockInStore((state) => state.selectedStockIn);
  const isLoading = useStockInStore((state) => state.isLoading);

  // ================= STORE ACTIONS =================
  const fetchStockIns = useStockInStore((state) => state.fetchStockIns);
  const fetchReferenceData = useStockInStore(
    (state) => state.fetchReferenceData
  );
  const openCreateModal = useStockInStore((state) => state.openCreateModal);
  const openEditModal = useStockInStore((state) => state.openEditModal);
  const openDetailModal = useStockInStore((state) => state.openDetailModal);
  const closeDetailModal = useStockInStore((state) => state.closeDetailModal);
  const deleteStockIn = useStockInStore((state) => state.deleteStockIn);

  // ================= MONTH FILTER =================
  const [filterMonth, setFilterMonth] = useState("");

  const monthOptions = useMemo(() => {
    const seen = new Set<string>();
    stockIns.forEach((slip) => {
      const d = new Date(slip.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      seen.add(key);
    });
    return Array.from(seen).sort().reverse();
  }, [stockIns]);

  const filteredStockIns = useMemo(() => {
    if (!filterMonth) return stockIns;
    return stockIns.filter((slip) => {
      const d = new Date(slip.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === filterMonth;
    });
  }, [stockIns, filterMonth]);

  const stats = useMemo(
    () => ({
      total: filteredStockIns.length,
      completed: filteredStockIns.filter((s) => s.status === "COMPLETED").length,
      totalValue: filteredStockIns.reduce((sum, s) => sum + s.totalAmount, 0),
    }),
    [filteredStockIns]
  );

  // ================= TABLE SETUP =================
  const searchFn = useCallback(
    (slip: StockIn, keyword: string) => {
      const slipCode = slip.id.slice(0, 8).toLowerCase();
      const supplierName = slip.supplier?.name?.toLowerCase() ?? "";
      return slipCode.includes(keyword) || supplierName.includes(keyword);
    },
    []
  );

  const table = useClientTable<StockIn>({
    data: filteredStockIns,
    pageSize: 10,
    searchFn,
  });

  // ================= LIFECYCLE =================
  useEffect(() => {
    void Promise.all([fetchStockIns(), fetchReferenceData()]);
  }, [fetchStockIns, fetchReferenceData]);

  // ================= DELETE HANDLER =================
  const handleRemoveSlip = useCallback(
    async (id: string) => {
      void confirmAndRun({
        message:
          "Bạn có chắc muốn hủy phiếu nhập này? Tồn kho sẽ được hoàn lại và phiếu sẽ chuyển sang trạng thái Đã hủy.",
        action: () => deleteStockIn(id),
      });
    },
    [confirmAndRun, deleteStockIn]
  );

  const renderTableBody = () => {
    if (isLoading && table.pagedData.length === 0) {
      return <TableLoadingRow colSpan={6} text="Đang tải dữ liệu phiếu nhập..." />;
    }

    if (table.pagedData.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📄</span>
              <p className="font-medium text-gray-600">Chưa có phiếu nhập nào.</p>
              <p className="text-sm">Hãy thử thêm phiếu mới hoặc thay đổi bộ lọc.</p>
            </div>
          </td>
        </tr>
      );
    }

    return table.pagedData.map((slip) => (
      <tr
        key={slip.id}
        className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
      >
        <td className="px-6 py-4 font-mono text-gray-900 font-bold">
          <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 shadow-sm text-xs">
            #{slip.id.slice(0, 8).toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="font-semibold text-gray-800">
            {slip.supplier?.name || "—"}
          </div>
        </td>
        <td className="px-6 py-4 text-gray-500 font-medium">
          {new Date(slip.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })}
        </td>
        <td className="px-6 py-4">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border",
              statusStyle[slip.status] ??
                "bg-gray-50 text-gray-700 border-gray-200"
            )}
          >
            {statusLabel[slip.status] ?? slip.status}
          </span>
        </td>
        <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">
          {formatNumberWithDong(slip.totalAmount)}
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => openDetailModal(slip.id)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Xem chi tiết"
            >
              <Eye size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => openEditModal(slip)}
              disabled={slip.status === "CANCELLED"}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:bg-gray-50"
              title={slip.status === "CANCELLED" ? "Phiếu đã hủy, không thể sửa" : "Sửa phiếu nhập"}
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleRemoveSlip(slip.id)}
              disabled={slip.status === "CANCELLED"}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:bg-gray-50"
              title={slip.status === "CANCELLED" ? "Phiếu đã hủy" : "Hủy phiếu nhập"}
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
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <FileText size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Quản lý nhập kho
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý phiếu nhập theo CRUD: thêm, sửa, xóa, xem chi tiết
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
              <Plus size={18} strokeWidth={2.5} /> Tạo phiếu nhập
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-blue-100/50">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng phiếu nhập</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
              <Package className="text-blue-600" size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-emerald-100/50">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="text-emerald-600" size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-violet-100/50">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng giá trị nhập</p>
              <p className="text-2xl font-bold text-violet-700 truncate">
                {formatNumberWithDong(stats.totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-inner">
              <TrendingUp className="text-violet-600" size={22} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={table.searchTerm}
              onSearchChange={table.setSearchTerm}
              searchPlaceholder="Tìm mã phiếu hoặc tên nhà cung cấp..."
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Mã phiếu</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Nhà cung cấp</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Ngày tạo</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Trạng thái</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Tổng tiền</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Thao tác</th>
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

      {/* FORM MODAL — rendered in its own component to isolate form re-renders from the table */}
      <ImportSlipFormModal />

      {/* DETAIL MODAL */}
      <AppModal
        isOpen={Boolean(selectedStockIn)}
        onClose={closeDetailModal}
        title="Chi tiết phiếu nhập"
        maxWidthClassName="max-w-3xl"
      >
        {selectedStockIn && (
          <div className="p-6 space-y-6 bg-white">
            {/* DETAIL INFO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Người lập</div>
                <div className="font-bold text-gray-900">
                  {selectedStockIn.creatorName || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái</div>
                <div className="font-bold text-gray-900">
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm",
                    statusStyle[selectedStockIn.status] ?? "bg-gray-50 text-gray-700 border-gray-200"
                  )}>
                    {statusLabel[selectedStockIn.status] ?? selectedStockIn.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Ngày tạo</div>
                <div className="font-bold text-gray-900">
                  {new Date(selectedStockIn.date).toLocaleString("vi-VN")}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Nhà cung cấp</div>
                <div className="font-bold text-gray-900">
                  {selectedStockIn.supplier?.name || "N/A"}
                </div>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center">SL</th>
                    <th className="px-4 py-3 text-right">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedStockIn.details?.map((detail) => (
                    <tr key={detail.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {detail.product?.name}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">
                        {detail.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatNumberWithDong(detail.price)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {formatNumberWithDong(detail.quantity * detail.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTAL */}
            <div className="flex justify-end items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
              <span className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mr-4">
                Tổng cộng
              </span>
              <span className="text-2xl font-bold text-blue-700">
                {formatNumberWithDong(selectedStockIn.totalAmount)}
              </span>
            </div>

            {/* CLOSE BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
