import { useEffect, useState, useMemo } from 'react'
import { useStockInStore } from '@/stores/stockIn.store'
import { StockInStatus, type StockInDetailInput } from '@/types/warehouse.type'
import { Plus, Trash2, Eye, CheckCircle2, User, Calendar, Tag } from 'lucide-react'
import { DataTableToolbar } from '@/components/common/DataTableToolbar'
import { PaginationControls } from '@/components/common/PaginationControls'
import { useClientTable } from '@/hooks/useClientTable'
import { AppModal } from '@/components/common/AppModal'
import { cn } from '@/lib/utils' // Giả sử bạn có helper classname

export default function ImportSlipManagement() {
    const {
        stockIns, products, suppliers, isLoading, selectedStockIn,
        fetchStockIns, fetchReferenceData, fetchStockInById,
        clearSelectedStockIn, createTicket, confirmTicket
    } = useStockInStore()

    const [formOpen, setFormOpen] = useState(false)
    const [supplierId, setSupplierId] = useState('')
    const [details, setDetails] = useState<StockInDetailInput[]>([{ productId: '', quantity: 1, price: 0 }])

    const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
        data: stockIns,
        pageSize: 10,
        searchFn: (slip, keyword) => {
            const slipCode = slip.id.slice(0, 8).toLowerCase()
            const supplierName = slip.supplier?.name?.toLowerCase() ?? ''
            return slipCode.includes(keyword) || supplierName.includes(keyword)
        },
    })

    useEffect(() => {
        void Promise.all([fetchStockIns(), fetchReferenceData()])
    }, [fetchStockIns, fetchReferenceData])

    // Logic Helpers
    const updateDetail = (index: number, field: keyof StockInDetailInput, value: string | number) =>
        setDetails(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))

    const calcTotal = useMemo(() => details.reduce((sum, d) => sum + d.quantity * d.price, 0), [details])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await createTicket({ supplierId, details })
        setFormOpen(false)
        setSupplierId('')
        setDetails([{ productId: '', quantity: 1, price: 0 }])
    }

    // Badge Render Helper
    const renderStatusBadge = (status: StockInStatus) => {
        const styles = {
            [StockInStatus.PENDING]: "bg-amber-50 text-amber-600 border-amber-100",
            [StockInStatus.COMPLETED]: "bg-emerald-50 text-emerald-600 border-emerald-100",
            [StockInStatus.CANCELLED]: "bg-red-50 text-red-600 border-red-100",
        }
        const labels = {
            [StockInStatus.PENDING]: "Chờ duyệt",
            [StockInStatus.COMPLETED]: "Đã nhập kho",
            [StockInStatus.CANCELLED]: "Đã hủy",
        }
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[status])}>
                {labels[status]}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý nhập kho</h1>
                        <p className="text-sm text-gray-500 mt-1">Theo dõi trạng thái và phê duyệt phiếu nhập hàng</p>
                    </div>
                    <button
                        onClick={() => setFormOpen(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={18} /> Tạo phiếu nhập
                    </button>
                </div>

                {/* Main Table */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <DataTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
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
                                {isLoading && pagedData.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                                ) : pagedData.map((slip) => (
                                    <tr key={slip.id} className="hover:bg-gray-50/70 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-blue-600 font-medium">#{slip.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">{slip.supplier?.name || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(slip.date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">{renderStatusBadge(slip.status)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            {slip.totalAmount.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => fetchStockInById(slip.id)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <PaginationControls meta={meta} currentPage={page} isLoading={isLoading} onPageChange={setPage} />
                </div>
            </div>

            {/* Modal: Tạo phiếu mới */}
            <AppModal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Lập phiếu nhập kho" maxWidthClassName="max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nhà cung cấp *</label>
                            <select
                                value={supplierId}
                                onChange={e => setSupplierId(e.target.value)}
                                required
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 bg-gray-50/30"
                            >
                                <option value="">Chọn nhà cung cấp</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-semibold text-gray-700">Sản phẩm nhập</label>
                                <button
                                    type="button"
                                    onClick={() => setDetails([...details, { productId: '', quantity: 1, price: 0 }])}
                                    className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded"
                                >
                                    <Plus size={14} /> Thêm sản phẩm
                                </button>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {details.map((d, i) => (
                                    <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                                        <select
                                            value={d.productId}
                                            onChange={e => updateDetail(i, 'productId', e.target.value)}
                                            required
                                            className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg"
                                        >
                                            <option value="">Chọn SP...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input
                                            type="number" min={1} value={d.quantity}
                                            onChange={e => updateDetail(i, 'quantity', Number(e.target.value))}
                                            className="w-20 h-10 px-2 text-sm border border-gray-200 rounded-lg text-center"
                                            placeholder="SL"
                                        />
                                        <input
                                            type="number" min={0} value={d.price}
                                            onChange={e => updateDetail(i, 'price', Number(e.target.value))}
                                            className="w-32 h-10 px-2 text-sm border border-gray-200 rounded-lg text-right"
                                            placeholder="Giá"
                                        />
                                        {details.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setDetails(details.filter((_, idx) => idx !== i))}
                                                className="mt-2 text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl">
                        <span className="text-sm font-medium text-blue-900">Tổng giá trị dự kiến:</span>
                        <span className="text-xl font-bold text-blue-600">{calcTotal.toLocaleString('vi-VN')}đ</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2.5 text-sm font-medium text-gray-600">Huỷ</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Tạo phiếu</button>
                    </div>
                </form>
            </AppModal>

            {/* Modal: Chi tiết & Phê duyệt */}
            <AppModal
                isOpen={Boolean(selectedStockIn)}
                onClose={clearSelectedStockIn}
                title="Chi tiết phiếu nhập"
                maxWidthClassName="max-w-2xl"
            >
                {selectedStockIn && (
                    <div className="p-6 space-y-6">
                        {/* Status & Info Header */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500"><User size={14} /> Người lập:</div>
                                <div className="text-sm font-semibold text-gray-900">{selectedStockIn.creatorName}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500"><CheckCircle2 size={14} /> Người duyệt:</div>
                                <div className="text-sm font-semibold text-blue-600">{selectedStockIn.approverName}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500"><Calendar size={14} /> Ngày tạo:</div>
                                <div className="text-sm font-semibold text-gray-900">{new Date(selectedStockIn.date).toLocaleString('vi-VN')}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500"><Tag size={14} /> Trạng thái:</div>
                                <div>{renderStatusBadge(selectedStockIn.status)}</div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                                        <th className="px-4 py-3 text-center font-medium">SL</th>
                                        <th className="px-4 py-3 text-right font-medium">Đơn giá</th>
                                        <th className="px-4 py-3 text-right font-medium">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {selectedStockIn.details?.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-4 py-3 font-medium text-gray-700">{d.product?.name}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">{d.quantity}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{d.price.toLocaleString('vi-VN')}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">{(d.quantity * d.price).toLocaleString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-blue-50/30">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4 font-bold text-gray-700">Tổng cộng</td>
                                        <td className="px-4 py-4 text-right font-black text-blue-600 text-lg">
                                            {selectedStockIn.totalAmount.toLocaleString('vi-VN')}đ
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Actions: Nút Duyệt chỉ hiện khi trạng thái là PENDING */}
                        <div className="flex justify-end gap-3">
                            <button onClick={clearSelectedStockIn} className="px-6 py-2 text-sm font-medium text-gray-500 border rounded-xl hover:bg-gray-50">Đóng</button>
                            {selectedStockIn.status === StockInStatus.PENDING && (
                                <button
                                    onClick={() => confirmTicket(selectedStockIn.id)}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                                >
                                    <CheckCircle2 size={18} /> Xác nhận nhập kho
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </AppModal>
        </div>
    )
}
