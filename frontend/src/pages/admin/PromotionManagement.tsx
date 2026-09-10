import { useEffect, useMemo, useState, useCallback } from "react";
import { Tag, Plus, Pencil, Trash2, Power, Gift } from "lucide-react";
import { usePromotionStore } from "@/stores/promotion.store";
import type { Promotion } from "@/types/promotion.type";
import { PromotionFormModal } from "@/components/forms/PromotionFormModal";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { TableLoadingRow } from "@/components/common/Loading";

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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const activeCount = useMemo(
    () => promotions.filter((promotion) => promotion.isActive).length,
    [promotions],
  );

  const filteredPromotions = useMemo(() => {
    if (!searchTerm.trim()) return promotions;
    return promotions.filter((promotion) =>
      promotion.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [promotions, searchTerm]);

  const openCreateModal = useCallback(() => {
    setEditingPromotion(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((promotion: Promotion) => {
    setEditingPromotion(promotion);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa chương trình: ${name}?`)) {
      await deletePromotion(id);
    }
  }, [deletePromotion]);

  const handleToggleActive = useCallback(async (promotion: Promotion) => {
    await updatePromotion(promotion.id, {
      isActive: !promotion.isActive,
    });
  }, [updatePromotion]);

  const handleFormSubmit = useCallback(async (data: {
    name: string;
    type: "PERCENT" | "FIXED";
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
  }, [editingPromotion, updatePromotion, setPromotionProducts, createPromotion]);

  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={6} text="Đang tải dữ liệu..." />;
    
    if (filteredPromotions.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🎟️</span>
              <p className="font-medium text-gray-600">
                {searchTerm ? "Không tìm thấy chương trình nào phù hợp." : "Chưa có chương trình khuyến mãi nào."}
              </p>
              <p className="text-sm">Hãy thử tìm kiếm từ khóa khác hoặc tạo mới.</p>
            </div>
          </td>
        </tr>
      );
    }

    return filteredPromotions.map((promotion) => (
      <tr
        key={promotion.id}
        className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Gift size={20} />
            </div>
            <span className="font-semibold text-gray-900">{promotion.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600 font-medium">
          {promotion.type === "PERCENT" ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold">
              Phần trăm (%)
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
              Số tiền (đ)
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-gray-900 font-bold">
          {promotion.type === "PERCENT"
            ? `${promotion.value}%`
            : `${promotion.value.toLocaleString("vi-VN")} đ`}
        </td>
        <td className="px-6 py-4 text-gray-600">
          <span className="font-medium text-gray-800">{promotion.products.length}</span> sản phẩm
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm border border-white/20 ${
              promotion.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {promotion.isActive ? "Đang bật" : "Tắt"}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => openEditModal(promotion)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Chỉnh sửa"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleToggleActive(promotion)}
              className={`rounded-lg p-2 shadow-sm border transition-all active:scale-95 ${
                promotion.isActive 
                  ? "bg-white border-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" 
                  : "bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100"
              }`}
              title={promotion.isActive ? "Tắt khuyến mãi" : "Bật khuyến mãi"}
            >
              <Power size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleDelete(promotion.id, promotion.name)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
              title="Xóa"
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
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Tag className="text-blue-600" size={26} strokeWidth={2.5} />
              Chương trình khuyến mãi
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tạo và quản lý các chiến dịch giảm giá sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 shadow-inner">
              Đang hoạt động:{" "}
              <span className="font-bold text-blue-600 text-base">{activeCount}</span>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
              Thêm Chương trình
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo tên chương trình..."
            />
          </div>

          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Tên chương trình</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Loại giảm</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Giá trị</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Sản phẩm</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs">Trạng thái</th>
                    <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50 bg-white">
                  {renderTableBody()}
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
