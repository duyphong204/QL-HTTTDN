// frontend/src/pages/sales/ExportSlipManagement.tsx
import { useEffect, useState } from 'react'
import { useSalesStore } from '@/stores/sales.store'
import { Plus, Trash2, FileText } from 'lucide-react'
import { DataTableToolbar } from '@/components/common/DataTableToolbar'
import { PaginationControls } from '@/components/common/PaginationControls'
import { useClientTable } from '@/hooks/useClientTable'
import { AppModal } from '@/components/common/AppModal'

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export default function ExportSlipManagement() {
    const {
        orders,
        productOptions,
        isLoading,
        isLoadingProducts,
        fetchOrders,
        fetchProductOptions,
        createExportSlip,
    } = useSalesStore()
    const [formOpen, setFormOpen] = useState(false)
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [items, setItems] = useState([{ productId: '', quantity: 1 }])

    const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
        data: orders,
        pageSize: 10,
        searchFn: (order, keyword) => {
            const orderCode = order.id.slice(0, 8).toLowerCase()
            const name = order.fullName.toLowerCase()
            const phoneValue = order.phone.toLowerCase()
            return orderCode.includes(keyword) || name.includes(keyword) || phoneValue.includes(keyword)
        },
    })

    useEffect(() => {
        fetchOrders()
        fetchProductOptions()
    }, [fetchOrders, fetchProductOptions])

    const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1 }])
    const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
    const updateItem = (i: number, field: string, value: string | number) =>
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

    const calcTotal = () =>
        items.reduce((sum, item) => {
            const p = productOptions.find(x => x.id === item.productId)
            return sum + (p?.price || 0) * item.quantity
        }, 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await createExportSlip({ fullName, phone, address, items })
        setFormOpen(false)
        setFullName(''); setPhone(''); setAddress('')
        setItems([{ productId: '', quantity: 1 }])
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="text-blue-600" size={28} /> Phiếu xuất hàng
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Lập phiếu xuất sản phẩm cho hoạt động kinh doanh</p>
                    </div>
                    <button onClick={() => setFormOpen(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm">
                        <Plus size={18} /> Tạo phiếu xuất
                    </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <DataTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Tìm theo mã phiếu, khách hàng, số điện thoại..."
                    />

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Mã phiếu</th>
                                    <th className="px-6 py-4">Khách hàng</th>
                                    <th className="px-6 py-4">SĐT</th>
                                    <th className="px-6 py-4">Ngày xuất</th>
                                    <th className="px-6 py-4 text-right">Tổng tiền</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Đang tải...</td></tr>
                                ) : pagedData.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Chưa có phiếu xuất nào.</td></tr>
                                ) : pagedData.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-900">{o.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{o.fullName}</td>
                                        <td className="px-6 py-4 text-gray-600">{o.phone}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(o.totalAmount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{o.status}</span>
                                        </td>
                                    </tr>
                                ))}
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

            <AppModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                title="Tạo phiếu xuất hàng"
                maxWidthClassName="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên khách hàng *</label>
                                    <input value={fullName} onChange={e => setFullName(e.target.value)} required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Điện thoại *</label>
                                    <input value={phone} onChange={e => setPhone(e.target.value)} required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ giao hàng *</label>
                                <input value={address} onChange={e => setAddress(e.target.value)} required
                                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Sản phẩm xuất *</label>
                                    <button type="button" onClick={addItem}
                                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                        <Plus size={14} /> Thêm dòng
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} required
                                                className="flex-1 h-9 px-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500">
                                                <option value="">Chọn sản phẩm</option>
                                                {productOptions.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stockQuantity})</option>
                                                ))}
                                            </select>
                                            <input type="number" min={1} value={item.quantity}
                                                onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                                                className="w-20 h-9 px-2 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-blue-500" />
                                            {items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(i)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Tổng giá trị xuất:</span>
                                <span className="text-xl font-bold text-blue-600">{formatCurrency(calcTotal())}</span>
                            </div>

                            {isLoadingProducts && (
                                <p className="text-xs text-gray-500">Đang tải danh sách sản phẩm...</p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setFormOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Huỷ</button>
                                <button type="submit"
                                    className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Tạo phiếu xuất
                                </button>
                            </div>
                </form>
            </AppModal>
        </div>
    )
}
