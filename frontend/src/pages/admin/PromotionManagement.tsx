import { useEffect, useMemo, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Power } from 'lucide-react';
import { usePromotionStore } from '@/store/promotion.store';
import type { Promotion } from '@/types/promotion.type';
import { PromotionFormModal } from './components/PromotionFormModal';
import { DataTableToolbar } from '@/components/common/DataTableToolbar';

export default function PromotionManagement() {
  const {
    promotions,
    isLoading,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    setPromotionProducts,
    deletePromotion,
  } = usePromotionStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const activeCount = useMemo(
    () => promotions.filter((promotion) => promotion.isActive).length,
    [promotions],
  );

  const filteredPromotions = useMemo(() => {
    if (!searchTerm.trim()) return promotions;
    return promotions.filter(
      (promotion) =>
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [promotions, searchTerm]);

  const openCreateModal = () => {
    setEditingPromotion(null);
    setModalOpen(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa chương trình: ${name}?`)) {
      await deletePromotion(id);
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    type: any;
    value: number;
    startAt?: string;
    endAt?: string;
    isActive: boolean;
    productIds: string[];
  }) => {
    try {
      if (editingPromotion) {
        const { productIds, ...updateData } = data;
        await updatePromotion(editingPromotion.id, updateData);
        await setPromotionProducts(editingPromotion.id, productIds);
      } else {
        await createPromotion(data);
      }
      setModalOpen(false);
    } catch {
      // toast is handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Tag className="text-blue-600" size={26} />
              Quản lý Chương trình khuyến mãi
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tạo và quản lý chương trình giảm giá cho sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-sm text-gray-700">
              Đang hoạt động: <span className="font-semibold text-blue-700">{activeCount}</span>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus size={18} />
              Thêm Chương trình
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên chương trình..."
          />

          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-600">
                  <tr>
                    <th className="px-6 py-4">Tên chương trình</th>
                    <th className="px-6 py-4">Loại giảm</th>
                    <th className="px-6 py-4">Giá trị</th>
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : filteredPromotions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                        {searchTerm ? 'Không tìm thấy chương trình nào phù hợp.' : 'Chưa có chương trình nào.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPromotions.map((promotion) => (
                      <tr key={promotion.id} className="transition-colors hover:bg-gray-50/70">
                        <td className="px-6 py-4 font-semibold text-gray-900">{promotion.name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {promotion.type === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền (đ)'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {promotion.type === 'PERCENT'
                            ? `${promotion.value}%`
                            : `${promotion.value.toLocaleString('vi-VN')} đ`}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{promotion.products.length} sản phẩm</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              promotion.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {promotion.isActive ? 'Đang bật' : 'Tắt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => openEditModal(promotion)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() =>
                                updatePromotion(promotion.id, {
                                  isActive: !promotion.isActive,
                                })
                              }
                              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                              title={promotion.isActive ? 'Tắt' : 'Bật'}
                            >
                              <Power size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(promotion.id, promotion.name)}
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

      <PromotionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingPromotion={editingPromotion}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
