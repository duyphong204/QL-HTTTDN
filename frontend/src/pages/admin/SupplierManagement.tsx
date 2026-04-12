import { useSupplierManagement } from "@/hooks/useSupplierManagement"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { SupplierFormModal } from "@/components/forms/SupplierFormModal"
import { DataTableToolbar } from "@/components/common/DataTableToolbar"
import { PaginationControls } from "@/components/common/PaginationControls"

export default function SupplierManagement() {
  const {
    suppliers,
    meta,
    isLoading,
    modalOpen,
    setModalOpen,
    editingSupplier,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    goToPage,
    openCreateModal,
    openEditModal,
    handleDelete,
    handleFormSubmit,
  } = useSupplierManagement()

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Nhà cung cấp</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý thông tin nhà cung cấp hàng hóa</p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Thêm Nhà cung cấp
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative min-h-100">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
          >
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(":") as [string, "asc" | "desc"];
                updateFilters({ sortBy, sortOrder });
              }}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="name:asc">Tên A-Z</option>
              <option value="name:desc">Tên Z-A</option>
              <option value="email:asc">Email A-Z</option>
              <option value="email:desc">Email Z-A</option>
            </select>
          </DataTableToolbar>

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Tên NCC</th>
                    <th className="px-6 py-4">Điện thoại</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Địa chỉ</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {suppliers.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                        Không tìm thấy nhà cung cấp nào.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-gray-900">{supplier.name}</td>
                        <td className="px-6 py-4 text-gray-600">{supplier.phone || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{supplier.email || "—"}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-50 truncate">{supplier.address || "—"}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id, supplier.name)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

          <PaginationControls
            meta={meta}
            currentPage={filters.page}
            totalLabel="Tổng số"
            isLoading={isLoading}
            onPageChange={goToPage}
          />
        </div>
      </div>

      <SupplierFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingSupplier={editingSupplier}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
