import { useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useSupplierStore } from "@/stores/supplier.store";
import { useEntityModal } from "@/hooks/useEntityModal";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { usePaginatedList } from "@/hooks/usePaginatedList";

import { SupplierFormModal } from "@/components/forms/SupplierFormModal";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { OverlayLoading } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import type { Supplier, CreateSupplierDto } from "@/types/supplier.types";

export default function SupplierManagement() {
  // 1. Store State & Actions
  const {
    suppliers,
    meta,
    isLoading,
    filters,
    setFilters,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSupplierStore();

  // 2. UI Hooks
  const {
    modalOpen,
    editingEntity,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Supplier>();
  const { confirmAndRun } = useConfirmAction();

  // 3. Search & Pagination Logic
  const { searchTerm, setSearchTerm, updateFilters, goToPage } =
    usePaginatedList({
      filters,
      setFilters,
      fetchData: fetchSuppliers,
      debounceMs: 500,
    });

  // Initial Fetch
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // 4. Handlers
  const handleFormSubmit = useCallback(async (data: CreateSupplierDto) => {
    if (editingEntity) {
      await updateSupplier(editingEntity.id, data);
    } else {
      await createSupplier(data);
    }
    closeModal();
  }, [editingEntity, updateSupplier, createSupplier, closeModal]);

  const handleDelete = useCallback((id: string, name: string) => {
    void confirmAndRun({
      message: `Bạn có chắc muốn xóa nhà cung cấp: ${name}? Hành động này không thể hoàn tác.`,
      action: () => deleteSupplier(id),
    });
  }, [confirmAndRun, deleteSupplier]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(":") as [
      string,
      "asc" | "desc",
    ];
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // 5. Render Helpers
  const renderTableBody = () => {
    if (suppliers.length === 0 && !isLoading) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🏢</span>
              <p className="font-medium text-gray-600">Không tìm thấy nhà cung cấp nào.</p>
              <p className="text-sm">Vui lòng thử tìm kiếm với từ khóa khác.</p>
            </div>
          </td>
        </tr>
      );
    }

    return suppliers.map((supplier) => (
      <tr
        key={supplier.id}
        className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Building2 size={20} />
            </div>
            <span className="font-semibold text-gray-900">{supplier.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600 font-medium">
          {supplier.phone || "—"}
        </td>
        <td className="px-6 py-4 text-gray-600">
          {supplier.email || "—"}
        </td>
        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={supplier.address}>
          {supplier.address || "—"}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => openEditModal(supplier)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Sửa nhà cung cấp"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleDelete(supplier.id, supplier.name)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
              title="Xóa nhà cung cấp"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý Nhà cung cấp
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin và danh sách đối tác cung cấp hàng hóa
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            Thêm Nhà cung cấp
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative min-h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
            >
              <select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onChange={handleFilterChange}
                className="h-10 min-w-[160px] px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow font-medium text-gray-700 cursor-pointer"
              >
                <option value="name:asc">Tên A-Z</option>
                <option value="name:desc">Tên Z-A</option>
                <option value="email:asc">Email A-Z</option>
                <option value="email:desc">Email Z-A</option>
              </select>
            </DataTableToolbar>
          </div>

          <div className="relative">
            {isLoading && <OverlayLoading text="Đang tải dữ liệu..." />}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Tên NCC</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Điện thoại</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Email</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Địa chỉ</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50/50 bg-white">
                  {renderTableBody()}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={filters.page}
              totalLabel="Nhà cung cấp"
              isLoading={isLoading}
              onPageChange={goToPage}
            />
          </div>
        </div>
      </div>

      <SupplierFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingSupplier={editingEntity}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
