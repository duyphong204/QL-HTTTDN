import { FileText, Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { DataTableToolbar } from '@/components/common/DataTableToolbar'
import { PaginationControls } from '@/components/common/PaginationControls'
import { AppModal } from '@/components/common/AppModal'
import { InlineLoading, TableLoadingRow } from '@/components/common/Loading'
import { StockOutStatus, StockOutType } from '@/types/stockOut.types'
import { useExportSlipPage } from '@/hooks/useExportSlipPage'
import { formatCurrencyVnd } from '@/utils/format'

const statusBadgeClass: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
}

const typeLabel: Record<string, string> = {
  SALE: 'Bán hàng',
  INTERNAL: 'Nội bộ',
  TRANSFER: 'Điều chuyển',
}

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
    items,
    totalAmount,
    table,
    setType,
    setFilterStatus,
    setFilterType,
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
  } = useExportSlipPage()

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" size={28} /> Phiếu xuất hàng
            </h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý phiếu xuất theo CRUD: thêm, sửa, xóa, xem chi tiết</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm"
          >
            <Plus size={18} /> Tạo phiếu xuất
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 pb-2 flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={StockOutStatus.PENDING}>PENDING</option>
              <option value={StockOutStatus.COMPLETED}>COMPLETED</option>
              <option value={StockOutStatus.CANCELLED}>CANCELLED</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="">Tất cả loại phiếu</option>
              <option value={StockOutType.SALE}>Bán hàng</option>
              <option value={StockOutType.INTERNAL}>Nội bộ</option>
              <option value={StockOutType.TRANSFER}>Điều chuyển</option>
            </select>
          </div>

          <DataTableToolbar
            searchValue={table.searchTerm}
            onSearchChange={table.setSearchTerm}
            searchPlaceholder="Tìm theo mã phiếu, loại phiếu, trạng thái..."
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Mã phiếu</th>
                  <th className="px-6 py-4">Loại phiếu</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />
                ) : table.pagedData.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Chưa có phiếu xuất nào.</td></tr>
                ) : table.pagedData.map((stockOut) => (
                  <tr key={stockOut.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-900">{stockOut.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{typeLabel[stockOut.type] ?? stockOut.type}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(stockOut.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrencyVnd(stockOut.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass[stockOut.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {stockOut.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetailModal(stockOut.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(stockOut)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStockOut(stockOut.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <AppModal
        isOpen={formOpen}
        onClose={closeFormModal}
        title={editingId ? 'Cập nhật phiếu xuất' : 'Tạo phiếu xuất hàng'}
        maxWidthClassName="max-w-2xl"
      >
        <form onSubmit={submitForm} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại phiếu xuất *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as keyof typeof StockOutType)}
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value={StockOutType.SALE}>Bán hàng</option>
              <option value={StockOutType.INTERNAL}>Nội bộ</option>
              <option value={StockOutType.TRANSFER}>Điều chuyển</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Sản phẩm xuất *</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <Plus size={14} /> Thêm dòng
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_96px_128px_auto] gap-2 items-center">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, 'productId', e.target.value)}
                    required
                    className="h-9 px-2 text-sm border border-gray-200 rounded-lg bg-white"
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
                    onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                    required
                    className="h-9 px-2 text-sm border border-gray-200 rounded-lg text-center"
                  />

                  <input
                    type="number"
                    min={0}
                    step="1000"
                    value={item.price}
                    onChange={(e) => updateItem(i, 'price', Number(e.target.value))}
                    required
                    className="h-9 px-2 text-sm border border-gray-200 rounded-lg text-right"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Tổng giá trị xuất:</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrencyVnd(totalAmount)}</span>
          </div>

          {isLoadingProducts && <InlineLoading text="Đang tải danh sách sản phẩm..." className="justify-start text-xs text-gray-500" />}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium"
            >
              {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Tạo phiếu xuất'}
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
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Mã phiếu</div>
                <div className="font-medium">{selectedStockOut.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div>
                <div className="text-gray-500">Loại phiếu</div>
                <div className="font-medium">{typeLabel[selectedStockOut.type] ?? selectedStockOut.type}</div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Sản phẩm</th>
                    <th className="px-4 py-2 text-center">SL</th>
                    <th className="px-4 py-2 text-right">Đơn giá</th>
                    <th className="px-4 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStockOut.details.map((detail) => (
                    <tr key={detail.id} className="border-t">
                      <td className="px-4 py-2">{detail.product?.name ?? detail.productId}</td>
                      <td className="px-4 py-2 text-center">{detail.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrencyVnd(detail.price)}</td>
                      <td className="px-4 py-2 text-right font-semibold">{formatCurrencyVnd(detail.price * detail.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right font-bold text-blue-700">
              Tổng cộng: {formatCurrencyVnd(selectedStockOut.totalAmount)}
            </div>
          </div>
        )}
      </AppModal>
    </div>
  )
}