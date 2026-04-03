// frontend/src/components/warehouse/ProductFormModal.tsx
import { useEffect, useRef, useState } from 'react'
import type { Category, CreateProductDto, Product, Supplier, UpdateProductDto } from '@/types/warehouse.type'
import { Upload } from 'lucide-react'
import { AppModal } from '@/components/common/AppModal'

interface Props {
    isOpen: boolean
    onClose: () => void
    editingProduct: Product | null
    categories: Category[]
    suppliers: Supplier[]
    onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>
}

export function ProductFormModal({ isOpen, onClose, editingProduct, categories, suppliers, onSubmit }: Props) {
    const isEdit = !!editingProduct
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [objectPreviewUrl, setObjectPreviewUrl] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState<CreateProductDto>({
        name: '', description: '', price: 0, costPrice: 0,
        stockQuantity: 0, categoryId: '', supplierId: ''
    })

    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name,
                description: editingProduct.description ?? '',
                price: editingProduct.price,
                costPrice: editingProduct.costPrice,
                stockQuantity: editingProduct.stockQuantity,
                categoryId: editingProduct.categoryId,
                supplierId: editingProduct.supplierId,
            })
            setImagePreview(editingProduct.imageUrl ?? null)
        } else {
            setForm({ name: '', description: '', price: 0, costPrice: 0, stockQuantity: 0, categoryId: '', supplierId: '' })
            setImagePreview(null)
        }
    }, [editingProduct, isOpen])

    useEffect(() => {
        return () => {
            if (objectPreviewUrl) {
                URL.revokeObjectURL(objectPreviewUrl)
            }
        }
    }, [objectPreviewUrl])

    if (!isOpen) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: ['price', 'costPrice', 'stockQuantity'].includes(name) ? Number(value) : value }))
    }

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (objectPreviewUrl) {
            URL.revokeObjectURL(objectPreviewUrl)
        }
        const nextPreviewUrl = URL.createObjectURL(file)
        setForm(prev => ({ ...prev, image: file }))
        setImagePreview(nextPreviewUrl)
        setObjectPreviewUrl(nextPreviewUrl)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try { await onSubmit(form) } finally { setLoading(false) }
    }

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
            maxWidthClassName="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên sản phẩm *</label>
                        <input name="name" value={form.name} onChange={handleChange} required
                            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Nhập tên sản phẩm" />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            placeholder="Mô tả sản phẩm" />
                    </div>

                    {/* Giá */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá bán (đ) *</label>
                            <input name="price" type="number" min={0} value={form.price} onChange={handleChange} required
                                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá nhập (đ) *</label>
                            <input name="costPrice" type="number" min={0} value={form.costPrice} onChange={handleChange} required
                                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                    </div>

                    {/* Tồn kho */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng tồn kho</label>
                        <input name="stockQuantity" type="number" min={0} value={form.stockQuantity} onChange={handleChange}
                            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    {/* Danh mục & Nhà cung cấp */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục *</label>
                            <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                                <option value="">Chọn danh mục</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhà cung cấp *</label>
                            <select name="supplierId" value={form.supplierId} onChange={handleChange} required
                                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                                <option value="">Chọn nhà cung cấp</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Ảnh */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh sản phẩm</label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        >
                            {imagePreview
                                ? <img src={imagePreview} className="h-28 object-contain mx-auto rounded-lg" />
                                : <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                                    <Upload size={24} />
                                    <span className="text-sm">Click để chọn ảnh</span>
                                </div>
                            }
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Huỷ
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60">
                            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
            </form>
        </AppModal>
    )
}
