import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Tag, Layers } from "lucide-react";
import { AppModal } from "@/components/common/AppModal";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { TableLoadingRow } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import { Input } from "@/components/ui/input";

import { useCategoryStore } from "@/stores/category.store";
import { useEntityModal } from "@/hooks/useEntityModal";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useClientTable } from "@/hooks/useClientTable";
import type { Category } from "@/types/product.types";

export default function CategoryManagement() {
  // 1. Store State & Actions
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  // 2. Local State cho Form
  const [name, setName] = useState("");

  // 3. UI Hooks
  const {
    modalOpen,
    editingEntity: editingCategory,
    openCreateModal: baseOpenCreateModal,
    openEditModal: baseOpenEditModal,
    closeModal,
  } = useEntityModal<Category>();

  const { confirmAndRun } = useConfirmAction();

  // 4. Client-side Table Logic
  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } =
    useClientTable({
      data: categories,
      pageSize: 10,
      searchFn: useCallback((item: Category, query: string) =>
        item.name.toLowerCase().includes(query.toLowerCase()), []),
    });

  // Initial Fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 5. Handlers
  const openCreateModal = useCallback(() => {
    setName("");
    baseOpenCreateModal();
  }, [baseOpenCreateModal]);

  const openEditModal = useCallback((category: Category) => {
    setName(category.name);
    baseOpenEditModal(category);
  }, [baseOpenEditModal]);

  const handleFormSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, normalizedName);
    } else {
      await createCategory(normalizedName);
    }

    closeModal();
    setName("");
  }, [name, editingCategory, updateCategory, createCategory, closeModal]);

  const handleDelete = useCallback((id: string, categoryName: string) => {
    void confirmAndRun({
      message: `Bạn có chắc muốn xoá danh mục "${categoryName}"? Hành động này không thể hoàn tác.`,
      action: () => deleteCategory(id),
    });
  }, [confirmAndRun, deleteCategory]);

  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={3} text="Đang tải dữ liệu..." />;
    
    if (pagedData.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📂</span>
              <p className="font-medium text-gray-600">Không tìm thấy danh mục nào.</p>
              <p className="text-sm">Hãy thử thêm danh mục mới hoặc thay đổi từ khóa.</p>
            </div>
          </td>
        </tr>
      );
    }

    return pagedData.map((cat) => (
      <tr
        key={cat.id}
        className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100">
              <Tag size={18} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-gray-900">{cat.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
            {cat._count?.products || 0} sản phẩm
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-end gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => openEditModal(cat)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Sửa danh mục"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleDelete(cat.id, cat.name)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
              title="Xóa danh mục"
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
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Layers size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Danh mục sản phẩm
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Phân loại và tổ chức các nhóm mặt hàng
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> 
            Thêm danh mục
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo tên danh mục..."
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Thông tin danh mục</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Số lượng sản phẩm</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={page}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AppModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory ? "Cập nhật danh mục" : "Thêm mới danh mục"}
        subtitle="Vui lòng nhập tên danh mục duy nhất để phân loại sản phẩm"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Gia dụng, Điện tử..."
              className="h-11 focus:ring-blue-500/20 bg-gray-50 focus:bg-white"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all disabled:opacity-50"
            >
              {editingCategory ? "Cập nhật" : "Lưu dữ liệu"}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
  );
}
