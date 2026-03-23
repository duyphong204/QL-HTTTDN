// frontend/src/pages/warehouse/ProductManagement.tsx
import { useEffect, useState } from 'react'
import { categoryApi, supplierApi } from '@/api/warehouse.api'
import { useProductStore } from '@/store/product.store'
import type {
    Product, Category, Supplier,
    CreateProductDto, UpdateProductDto,
} from '@/types/warehouse.type'
import { Plus, Pencil, Trash2, Search, Package, RefreshCw } from 'lucide-react'
import { ProductFormModal } from '@/components/warehouse/ProductFormModal'

export default function ProductManagement() {

    const {
        products, isLoading, meta, filters,
        fetchProducts, setFilters, createProduct, updateProduct, deleteProduct
    } = useProductStore()

    const [categories, setCategories] = useState<Category[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])

    const [modalOpen, setModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [filters, fetchProducts])

    useEffect(() => {
        Promise.all([categoryApi.getCategories(), supplierApi.getSuppliers()])
            .then(([cats, sups]) => {
                setCategories(cats)
                setSuppliers(sups.data ?? sups)
            })
    }, [])

    const openCreateModal = () => { setEditingProduct(null); setModalOpen(true) }
    const openEditModal = (p: Product) => { setEditingProduct(p); setModalOpen(true) }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc muốn xoá sản phẩm "${name}"?`)) return
        await deleteProduct(id)
    }

    const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
        if (editingProduct) {
            await updateProduct(editingProduct.id, data as UpdateProductDto)
        } else {
            await createProduct(data as CreateProductDto)
        }
        setModalOpen(false)
        fetchProducts()
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Quản lý sản phẩm
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa thông tin sản phẩm trong kho</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Thêm sản phẩm
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">
                    <div className="p-4 border-b border-gray-50">
                        <div className="relative max-w-xl">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                placeholder="Tìm theo tên sản phẩm..."
                                onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                                className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4">Danh mục</th>
                                    <th className="px-6 py-4">Nhà cung cấp</th>
                                    <th className="px-6 py-4 text-right">Giá bán</th>
                                    <th className="px-6 py-4 text-right">Giá nhập</th>
                                    <th className="px-6 py-4 text-center">Tồn kho</th>
                                    <th className="px-6 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                                        <RefreshCw size={24} className="animate-spin mx-auto text-blue-500" />
                                    </td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Không có sản phẩm nào.</td></tr>
                                ) : products.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {p.imageUrl
                                                    ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                                    : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={18} className="text-gray-400" /></div>
                                                }
                                                <span className="font-medium text-gray-800">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{p.category?.name || '—'}</td>
                                        <td className="px-6 py-4 text-gray-600">{p.supplier?.name || '—'}</td>
                                        <td className="px-6 py-4 text-right text-gray-800 font-medium">
                                            {p.price.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {p.costPrice.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${p.stockQuantity <= (p.minStock ?? 10)
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-green-100 text-green-600'
                                                }`}>
                                                {p.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Xóa"
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

                    {/* Pagination */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-50">
                        <span className="text-sm text-gray-500">Trang {filters.page} / {meta?.totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ page: (filters.page ?? 1) - 1 })}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <button
                                disabled={filters.page === (meta?.totalPages || 1)}
                                onClick={() => setFilters({ page: (filters.page ?? 1) + 1 })}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Tiếp
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ProductFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editingProduct={editingProduct}
                categories={categories}
                suppliers={suppliers}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
