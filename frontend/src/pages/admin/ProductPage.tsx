import { useEffect, useState } from "react"
import { useProductStore } from "@/store/product.store"
import { Search, Plus, Pencil, Trash2, Package, Layers, Tag } from "lucide-react"

export default function ProductManagement() {
  const {
    products,
    isLoading,
    fetchProducts,
    deleteProduct,
    setFilters
  } = useProductStore()

  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    setFilters({ search: value })
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Xóa sản phẩm ${name}?`)) {
      await deleteProduct(id)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Package className="text-blue-600" size={28} />
              Quản lý sản phẩm
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              CRUD sản phẩm kho và điều chỉnh tồn kho
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95">
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          
          {/* SEARCH BAR */}
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={handleSearch}
                placeholder="Tìm sản phẩm theo tên..."
                className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center whitespace-nowrap"> {/* Thêm text-center ở đây cho toàn bảng */}
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-center">Ảnh</th>
                  <th className="px-6 py-4 text-center">Tên sản phẩm</th>
                  <th className="px-6 py-4 text-center">Danh mục</th>
                  <th className="px-6 py-4 text-center">Nhà cung cấp</th>
                  <th className="px-6 py-4 text-center">Giá</th>
                  <th className="px-6 py-4 text-center">Tồn kho</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Đang tải dữ liệu sản phẩm...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Không có sản phẩm nào trong kho
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group">
                      {/* ẢNH */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center"> {/* Căn giữa ảnh trong ô */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                            <img
                              src={p.imageUrl || "/placeholder.png"}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              alt={p.name}
                            />
                          </div>
                        </div>
                      </td>

                      {/* TÊN */}
                      <td className="px-6 py-4 text-center">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tight">ID: {p.id.slice(-6)}</div>
                      </td>

                      {/* DANH MỤC */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                            <Layers size={12} />
                            {p.category?.name || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* NHÀ CUNG CẤP */}
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center justify-center gap-1"> 
                          <Tag size={14} className="text-gray-400" />
                          {p.supplier?.name || "N/A"}
                        </div>
                      </td>

                      {/* GIÁ */}
                      <td className="px-6 py-4 text-center font-bold text-gray-900">
                        {p.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal ml-0.5">₫</span>
                      </td>

                      {/* TỒN KHO */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.stockQuantity <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>

                      {/* THAO TÁC */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>
      </div>
    </div>
  )
}