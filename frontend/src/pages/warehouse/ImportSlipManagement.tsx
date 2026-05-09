import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Eye, Pencil, Package, CheckCircle2, TrendingUp } from "lucide-react";
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
      await confirmAndRun({
        message:
          "Bạn có chắc muốn hủy phiếu nhập này? Tồn kho sẽ được hoàn lại và phiếu sẽ chuyển sang trạng thái Đã hủy.",
        action: () => deleteStockIn(id),
      });
    },
    [confirmAndRun, deleteStockIn]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý nhập kho
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý phiếu nhập theo CRUD: thêm, sửa, xóa, xem chi tiết
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white shadow-sm"
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
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Plus size={18} /> Tạo phiếu nhập
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Package className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng phiếu nhập</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-emerald-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <TrendingUp className="text-violet-600" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng giá trị nhập</p>
              <p className="text-lg font-bold text-gray-900 truncate">
                {formatNumberWithDong(stats.totalValue)}
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTableToolbar
            searchValue={table.searchTerm}
            onSearchChange={table.setSearchTerm}
            searchPlaceholder="Tìm mã phiếu hoặc nhà cung cấp..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Mã phiếu</th>
                  <th className="px-6 py-4">Nhà cung cấp</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading && table.pagedData.length === 0 ? (
                  <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />
                ) : (
                  table.pagedData.map((slip) => (
                    <tr
                      key={slip.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                        #{slip.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {slip.supplier?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(slip.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            statusStyle[slip.status] ??
                              "bg-gray-50 text-gray-700 border-gray-100"
                          )}
                        >
                          {statusLabel[slip.status] ?? slip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {formatNumberWithDong(slip.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openDetailModal(slip.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(slip)}
                            disabled={slip.status === "CANCELLED"}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={slip.status === "CANCELLED" ? "Phiếu đã hủy, không thể sửa" : undefined}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleRemoveSlip(slip.id)}
                            disabled={slip.status === "CANCELLED"}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={slip.status === "CANCELLED" ? "Phiếu đã hủy" : "Hủy phiếu nhập"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={table.meta}
            currentPage={table.page}
            isLoading={isLoading}
            onPageChange={table.setPage}
          />
        </div>
      </div>

      {/* FORM MODAL — rendered in its own component to isolate form re-renders from the table */}
      <ImportSlipFormModal />

      {/* DETAIL MODAL */}
      <AppModal
        isOpen={Boolean(selectedStockIn)}
        onClose={closeDetailModal}
        title="Chi tiết phiếu nhập"
        maxWidthClassName="max-w-2xl"
      >
        {selectedStockIn && (
          <div className="p-6 space-y-6">
            {/* DETAIL INFO */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm">
              <div>
                <div className="text-gray-500">Người lập</div>
                <div className="font-semibold text-gray-900">
                  {selectedStockIn.creatorName || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Trạng thái</div>
                <div className="font-semibold text-gray-900">
                  {statusLabel[selectedStockIn.status] ??
                    selectedStockIn.status}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Ngày tạo</div>
                <div className="font-semibold text-gray-900">
                  {new Date(selectedStockIn.date).toLocaleString("vi-VN")}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Nhà cung cấp</div>
                <div className="font-semibold text-gray-900">
                  {selectedStockIn.supplier?.name || "N/A"}
                </div>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center font-medium">SL</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedStockIn.details?.map((detail) => (
                    <tr key={detail.id}>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {detail.product?.name}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
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
                <tfoot className="bg-blue-50/30">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-4 font-bold text-gray-700"
                    >
                      Tổng cộng
                    </td>
                    <td className="px-4 py-4 text-right font-black text-blue-600 text-lg">
                      {formatNumberWithDong(selectedStockIn.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* CLOSE BUTTON */}
            <div className="flex justify-end">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 text-sm font-medium text-gray-500 border rounded-xl hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
