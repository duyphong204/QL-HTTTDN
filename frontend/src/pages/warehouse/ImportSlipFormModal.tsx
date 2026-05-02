import { useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppModal } from "@/components/common/AppModal";
import { useStockInStore } from "@/stores/stockIn.store";
import { formatNumberWithDong } from "@/utils/format";

export default function ImportSlipFormModal() {
  const formOpen = useStockInStore((state) => state.formOpen);
  const editingId = useStockInStore((state) => state.editingId);
  const supplierId = useStockInStore((state) => state.supplierId);
  const details = useStockInStore((state) => state.details);
  const products = useStockInStore((state) => state.products);
  const suppliers = useStockInStore((state) => state.suppliers);

  const closeFormModal = useStockInStore((state) => state.closeFormModal);
  const setSupplierId = useStockInStore((state) => state.setSupplierId);
  const addDetail = useStockInStore((state) => state.addDetail);
  const removeDetail = useStockInStore((state) => state.removeDetail);
  const updateDetail = useStockInStore((state) => state.updateDetail);
  const createStockIn = useStockInStore((state) => state.createStockIn);
  const updateStockInAction = useStockInStore((state) => state.updateStockIn);

  const totalAmount = useMemo(
    () => details.reduce((sum, d) => sum + d.quantity * d.price, 0),
    [details]
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const payload = { supplierId, details };
      if (editingId) {
        await updateStockInAction(editingId, payload);
      } else {
        await createStockIn(payload);
      }
    },
    [supplierId, details, editingId, updateStockInAction, createStockIn]
  );

  return (
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
                  <div key={detail._uid} className="flex gap-3 items-start">
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
                            {product.stockQuantity}
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
  );
}
