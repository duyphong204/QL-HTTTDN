// frontend/src/pages/warehouse/ImportSlipManagement.tsx
import { useEffect, useState } from 'react'
import { stockInApi, productApi, supplierApi } from '@/api/warehouse.api'
import type { StockIn, Product, Supplier, CreateStockInDto, StockInDetailInput } from '@/types/warehouse.type'
import { Plus, Trash2, FileText, Eye } from 'lucide-react'

export default function ImportSlipManagement() {
    const [stockIns, setStockIns] = useState<StockIn[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [detailItem, setDetailItem] = useState<StockIn | null>(null)

    // Form state
    const [supplierId, setSupplierId] = useState('')
    const [details, setDetails] = useState<StockInDetailInput[]>([
        { productId: '', quantity: 1, price: 0 }
    ])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [slips, prods, sups] = await Promise.all([
                stockInApi.getStockIns(),
                productApi.getProducts({ limit: 100 }),
                supplierApi.getSuppliers({ limit: 100 }),
            ])
            setStockIns(slips)
            setProducts(prods.data ?? prods)
            setSuppliers(sups.data ?? sups)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const addDetailRow = () =>
        setDetails(prev => [...prev, { productId: '', quantity: 1, price: 0 }])

    const removeDetailRow = (index: number) =>
        setDetails(prev => prev.filter((_, i) => i !== index))

    const updateDetail = (index: number, field: keyof StockInDetailInput, value: string | number) =>
        setDetails(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))

    const calcTotal = () => details.reduce((sum, d) => sum + d.quantity * d.price, 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const dto: CreateStockInDto = { supplierId, details }
        await stockInApi.createStockIn(dto)
        setFormOpen(false)
        setSupplierId('')
        setDetails([{ productId: '', quantity: 1, price: 0 }])
        fetchData()
    }

    const handleViewDetail = async (id: string) => {
        const slip = await stockInApi.getStockInById(id)
        setDetailItem(slip)
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Phiếu nhập kho</h1>
                        <p className="text-sm text-gray-500 mt-1">Lập phiếu nhập sản phẩm vào kho</p>
                    </div>
                    <button
                        onClick={() => setFormOpen(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Tạo phiếu nhập
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Mã phiếu</th>
                                    <th className="px-6 py-4">Nhà cung cấp</th>
                                    <th className="px-6 py-4">Ngày nhập</th>
                                    <th className="px-6 py-4 text-right">Tổng tiền</th>
                                    <th className="px-6 py-4 text-center">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Đang tải...</td></tr>
                                ) : stockIns.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Chưa có phiếu nhập nào.</td></tr>
                                ) : stockIns.map((slip) => (
                                    <tr key={slip.id} className="hover:bg-gray-50/70 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-gray-900">{slip.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-gray-700">{slip.supplier?.name || '—'}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(slip.date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                                            {slip.totalAmount.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetail(slip.id)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Form Modal */}
            {formOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Tạo phiếu nhập kho</h2>
                            <button onClick={() => setFormOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Nhà cung cấp */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhà cung cấp *</label>
                                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required
                                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                                    <option value="">Chọn nhà cung cấp</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Danh sách sản phẩm */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Danh sách sản phẩm nhập *</label>
                                    <button type="button" onClick={addDetailRow}
                                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                        <Plus size={14} /> Thêm dòng
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {details.map((d, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <select value={d.productId} onChange={e => updateDetail(i, 'productId', e.target.value)} required
                                                className="flex-1 h-9 px-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500">
                                                <option value="">Chọn sản phẩm</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <input type="number" min={1} value={d.quantity} onChange={e => updateDetail(i, 'quantity', Number(e.target.value))}
                                                placeholder="SL" required
                                                className="w-20 h-9 px-2 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-blue-500" />
                                            <input type="number" min={0} value={d.price} onChange={e => updateDetail(i, 'price', Number(e.target.value))}
                                                placeholder="Giá nhập" required
                                                className="w-32 h-9 px-2 text-sm border border-gray-200 rounded-lg text-right focus:outline-none focus:border-blue-500" />
                                            {details.length > 1 && (
                                                <button type="button" onClick={() => removeDetailRow(i)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tổng tiền */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Tổng giá trị nhập:</span>
                                <span className="text-xl font-bold text-blue-600">{calcTotal().toLocaleString('vi-VN')}đ</span>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setFormOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    Huỷ
                                </button>
                                <button type="submit"
                                    className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Tạo phiếu nhập
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailItem && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Chi tiết phiếu nhập</h2>
                                <p className="text-xs text-gray-500 mt-0.5">NCC: {detailItem.supplier?.name}</p>
                            </div>
                            <button onClick={() => setDetailItem(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-100">
                                    <tr className="text-gray-500 text-xs uppercase tracking-wide">
                                        <th className="pb-2 text-left">Sản phẩm</th>
                                        <th className="pb-2 text-center">SL</th>
                                        <th className="pb-2 text-right">Giá nhập</th>
                                        <th className="pb-2 text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {detailItem.details?.map((d) => (
                                        <tr key={d.id}>
                                            <td className="py-3 text-gray-700">{d.product?.name || d.productId}</td>
                                            <td className="py-3 text-center">{d.quantity}</td>
                                            <td className="py-3 text-right">{d.price.toLocaleString('vi-VN')}đ</td>
                                            <td className="py-3 text-right font-medium">{(d.quantity * d.price).toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-gray-200">
                                    <tr>
                                        <td colSpan={3} className="pt-3 font-semibold text-gray-700">Tổng cộng</td>
                                        <td className="pt-3 text-right font-bold text-blue-600 text-base">
                                            {detailItem.totalAmount.toLocaleString('vi-VN')}đ
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
