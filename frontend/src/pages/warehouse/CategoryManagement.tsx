import { useEffect, useState } from 'react';
import { Folder, Plus, Edit, Trash2 } from 'lucide-react';
import { useCategoryStore } from '@/store/category.store';

export default function CategoryManagement() {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    if (editingId) {
      await updateCategory(editingId, { name });
    } else {
      await createCategory({ name });
    }
    resetForm();
  };

  const startEdit = (category: (typeof categories)[0]) => {
    setEditingId(category.id);
    setName(category.name);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      await deleteCategory(id);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Folder className="text-blue-600" size={26} /> Quản lý Danh mục sản phẩm
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tạo, chỉnh sửa và quản lý danh mục sản phẩm
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm text-gray-700">
            Tổng cộng: <span className="font-semibold text-blue-700">{categories.length}</span>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
            </h2>

            <div className="flex gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên danh mục (ví dụ: Điện thoại, Laptop...)"
                className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-lg transition"
              >
                <Plus size={18} />
                {editingId ? 'Cập nhật' : 'Tạo'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            <Plus size={18} />
            Thêm danh mục mới
          </button>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Folder size={48} className="inline-block mb-3 text-gray-300" />
              <p className="text-lg">Chưa có danh mục nào</p>
              <p className="text-sm mt-1">Tạo danh mục đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Tên danh mục</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">Ngày tạo</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Folder size={18} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition text-sm font-medium"
                          >
                            <Edit size={16} />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="inline-flex items-center gap-1.5 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition text-sm font-medium"
                          >
                            <Trash2 size={16} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
