import { useEffect, useCallback, useState, useMemo } from 'react';
import { Folder, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useCategoryStore } from '@/store/category.store';
import { DataTableToolbar } from '@/components/common/DataTableToolbar';
import { AppModal } from '@/components/common/AppModal';
import type { Category } from '@/types/warehouse.type';

export default function CategoryManagement() {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const resetForm = () => {
    setName('');
    setEditingCategory(null);
  };

  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = useCallback((category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setModalOpen(true);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, { name });
    } else {
      await createCategory({ name });
    }
    closeModal();
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục: ${categoryName}?`)) {
      await deleteCategory(id);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Folder className="text-blue-600" size={26} /> Quản lý Danh mục sản phẩm
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tạo, chỉnh sửa và quản lý danh mục sản phẩm
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Thêm Danh mục
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm theo tên danh mục..."
          />

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
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4">Ngày tạo</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {filteredCategories.length === 0 && !isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-gray-400 font-medium">
                        {searchTerm ? 'Không tìm thấy danh mục nào.' : 'Chưa có danh mục nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Folder size={18} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(category)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Sửa"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, category.name)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Xóa"
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

      {/* Modal */}
      <AppModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        maxWidthClassName="sm:max-w-[425px]"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Điện thoại, Laptop, Phụ kiện..."
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-lg transition-all active:scale-95"
            >
              <Plus size={18} />
              {editingCategory ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
