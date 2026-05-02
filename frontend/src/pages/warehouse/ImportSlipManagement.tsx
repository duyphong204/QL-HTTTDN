import { useEffect, useMemo } from "react";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
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
  const products = useStockInStore((state) => state.products);
  const suppliers = useStockInStore((state) => state.suppliers);
  const isLoading = useStockInStore((state) => state.isLoading);
  const formOpen = useStockInStore((state) => state.formOpen);
  const editingId = useStockInStore((state) => state.editingId);
  const supplierId = useStockInStore((state) => state.supplierId);
  const details = useStockInStore((state) => state.details);

  // ================= STORE ACTIONS =================
  const fetchStockIns = useStockInStore((state) => state.fetchStockIns);
  const fetchReferenceData = useStockInStore(
    (state) => state.fetchReferenceData
  );
  const openCreateModal = useStockInStore((state) => state.openCreateModal);
  const openEditModal = useStockInStore((state) => state.openEditModal);
  const closeFormModal = useStockInStore((state) => state.closeFormModal);
  const openDetailModal = useStockInStore((state) => state.openDetailModal);
  const closeDetailModal = useStockInStore((state) => state.closeDetailModal);
  const setSupplierId = useStockInStore((state) => state.setSupplierId);
  const addDetail = useStockInStore((state) => state.addDetail);
  const removeDetail = useStockInStore((state) => state.removeDetail);
  const updateDetail = useStockInStore((state) => state.updateDetail);
  const createStockIn = useStockInStore((state) => state.createStockIn);
  const updateStockInAction = useStockInStore((state) => state.updateStockIn);
  const deleteStockIn = useStockInStore((state) => state.deleteStockIn);

  // ================= TABLE SETUP =================
  const table = useClientTable<StockIn>({
    data: stockIns,
    pageSize: 10,
    searchFn: (slip, keyword) => {
      const slipCode = slip.id.slice(0, 8).toLowerCase();
      const supplierName = slip.supplier?.name?.toLowerCase() ?? "";
      return slipCode.includes(keyword) || supplierName.includes(keyword);
    },
  });

  // ================= CALCULATE TOTAL =================
  const totalAmount = useMemo(
    () =>
      details.reduce((sum, detail) => sum + detail.quantity * detail.price, 0),
    [details]
  );

  // ================= LIFECYCLE =================
  useEffect(() => {
    void Promise.all([fetchStockIns(), fetchReferenceData()]);
  }, [fetchStockIns, fetchReferenceData]);

  // ================= FORM SUBMISSION =================
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      supplierId,
      details,
    };

    if (editingId) {
      await updateStockInAction(editingId, payload);
    } else {
      await createStockIn(payload);
    }
  };

  // ================= DELETE HANDLER =================
  const handleRemoveSlip = async (id: string) => {
    await confirmAndRun({
      message: "Bạn có chắc muốn xóa phiếu nhập này?",
      action: () => deleteStockIn(id),
    });
  };

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
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus size={18} /> Tạo phiếu nhập
          </button>
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
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleRemoveSlip(slip.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

      {/* FORM MODAL */}
      <AppModal
        isOpen={formOpen}
        onClose={closeFormModal}
        title={editingId ? "Cập nhật phiếu nhập kho" : "Lập phiếu nhập kho"}
        maxWidthClassName="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* SUPPLIER SELECT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nhà cung cấp *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50/30"
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCTS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Sản phẩm nhập
                </label>
                <button
                  type="button"
                  onClick={addDetail}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  <Plus size={14} /> Thêm sản phẩm
                </button>
              </div>

              <div className="space-y-3 max-h-75 overflow-y-auto pr-2">
                {details.map((detail, i) => {
                  const maxLength = 24;
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      {/* PRODUCT SELECT */}
                      <select
                        value={detail.productId}
                        onChange={(e) =>
                          updateDetail(i, "productId", e.target.value)
                        }
                        required
                        className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg"
                      >
                        <option value="">Chọn Sản phẩm cần nhập...</option>
                        {products.map((product) => {
                          const shortName =
                            product.name.length > maxLength
                              ? product.name.slice(0, maxLength) + "..."
                              : product.name;

                          return (
                            <option key={product.id} value={product.id}>
                              {shortName} -{" "}
                              {formatNumberWithDong(product.costPrice)}- {"SL :"}
                              {(product.stockQuantity)}
                            </option>
                          );
                        })}
                      </select>

                      {/* QUANTITY INPUT */}
                      <input
                        type="number"
                        min={1}
                        value={detail.quantity}
                        onChange={(e) =>
                          updateDetail(i, "quantity", Number(e.target.value))
                        }
                        className="w-20 h-10 px-2 text-sm border border-gray-200 rounded-lg text-center"
                      />

                      {/* PRICE INPUT */}
                      <input
                        type="number"
                        min={0}
                        value={detail.price}
                        onChange={(e) =>
                          updateDetail(i, "price", Number(e.target.value))
                        }
                        className="w-32 h-10 px-2 text-sm border border-gray-200 rounded-lg text-right"
                      />

                      {/* REMOVE BUTTON */}
                      {details.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetail(i)}
                          className="mt-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TOTAL AMOUNT */}
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl">
            <span className="text-sm font-medium text-blue-900">
              Tổng giá trị:
            </span>
            <span className="text-xl font-bold text-blue-600">
              {formatNumberWithDong(totalAmount)}
            </span>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-6 py-2.5 text-sm font-medium text-gray-600"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              {editingId ? "Lưu thay đổi" : "Tạo phiếu"}
            </button>
          </div>
        </form>
      </AppModal>

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
