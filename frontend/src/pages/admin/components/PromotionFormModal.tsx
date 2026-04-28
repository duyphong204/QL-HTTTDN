import { useEffect, useMemo, useState } from "react";
import type { PromotionType, Promotion } from "@/types/promotion.type";
import { AppModal } from "@/components/common/AppModal";
import { getCloudinaryThumbnailUrl } from "@/lib/cloudinary";
import { useProductStore } from "@/store/product.store";

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPromotion: Promotion | null;
  onSubmit: (data: {
    name: string;
    type: PromotionType;
    value: number;
    startAt?: string;
    endAt?: string;
    isActive: boolean;
    productIds: string[];
  }) => Promise<void>;
}

export function PromotionFormModal({
  isOpen,
  onClose,
  editingPromotion,
  onSubmit,
}: PromotionFormModalProps) {
  const isEditMode = !!editingPromotion;
  const { fetchProductsByQuery } = useProductStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<PromotionType>("PERCENT");
  const [value, setValue] = useState<number>(10);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allProducts, setAllProducts] = useState<
    Array<{ id: string; name: string; imageUrl?: string | null; categoryId?: string; categoryName?: string }>
  >([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("ALL");

  const toDateTimeLocalValue = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const resetForm = () => {
    setName("");
    setType("PERCENT");
    setValue(10);
    setStartAt("");
    setEndAt("");
    setIsActive(true);
    setSelectedProductIds([]);
    setProductCategoryFilter("ALL");
  };

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editingPromotion) {
      setName(editingPromotion.name);
      setType(editingPromotion.type);
      setValue(editingPromotion.value);
      setStartAt(toDateTimeLocalValue(editingPromotion.startAt));
      setEndAt(toDateTimeLocalValue(editingPromotion.endAt));
      setIsActive(editingPromotion.isActive);
      setSelectedProductIds(editingPromotion.products.map((link) => link.productId));
    } else {
      resetForm();
    }
  }, [isOpen, editingPromotion, isEditMode]);

  useEffect(() => {
    if (!isOpen) return;
    
    const loadProducts = async () => {
      const response = await fetchProductsByQuery({ page: 1, limit: 300, sortBy: "name" });
      setAllProducts(
        (response?.data ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          imageUrl: p.imageUrl,
          categoryId: p.categoryId,
          categoryName: p.category?.name,
        }))
      );
    };

    loadProducts();
  }, [isOpen, fetchProductsByQuery]);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    allProducts.forEach((product) => {
      if (product.categoryId && product.categoryName) {
        map.set(product.categoryId, product.categoryName);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  const visibleProducts = useMemo(() => {
    if (productCategoryFilter === "ALL") {
      return allProducts;
    }
    return allProducts.filter((product) => product.categoryId === productCategoryFilter);
  }, [allProducts, productCategoryFilter]);

  const visibleProductIds = useMemo(
    () => visibleProducts.map((product) => product.id),
    [visibleProducts]
  );

  const isAllProductsSelected =
    visibleProducts.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));

  const selectedProductNames = useMemo(
    () => allProducts.filter((product) => selectedProductIds.includes(product.id)).map((product) => product.name),
    [allProducts, selectedProductIds]
  );

  const handleSave = async () => {
    const payload = {
      name,
      type,
      value,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      isActive,
      productIds: selectedProductIds,
    };

    if (type === "PERCENT" && value > 100) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? "Chỉnh sửa chương trình" : "Tạo chương trình khuyến mãi"}
        subtitle={isEditMode ? "Cập nhật thông tin chương trình" : "Nhập thông tin chương trình mới"}
        maxWidthClassName="max-w-2xl"
      >
        <div className="space-y-4 p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên chương trình</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên chương trình"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại giảm giá</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PromotionType)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="PERCENT">Giảm theo %</option>
                <option value="FIXED">Giảm theo số tiền</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá trị giảm</label>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="Nhập giá trị"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái kích hoạt</label>
              <label className="h-10 w-full px-3 text-sm border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700 bg-white cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Kích hoạt ngay
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày kết thúc</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {type === "PERCENT" && value > 100 && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              Giá trị giảm theo % không được lớn hơn 100.
            </p>
          )}

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Gán sản phẩm - Đã chọn <span className="text-blue-700 font-semibold">{selectedProductIds.length}</span> sản phẩm
              </label>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Chọn sản phẩm
              </button>
            </div>
            {selectedProductNames.length > 0 && (
              <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-600 line-clamp-2">
                  {selectedProductNames.join(", ")}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || (type === "PERCENT" && value > 100) || isSubmitting}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </AppModal>

      {/* Product Picker Modal */}
      <AppModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title="Chọn sản phẩm áp dụng khuyến mãi"
        subtitle="Tick chọn sản phẩm muốn áp dụng"
        maxWidthClassName="sm:max-w-[780px]"
      >
        <div className="space-y-3 p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Danh mục</label>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="ALL">Tất cả</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-blue-700 pb-2 border-b border-gray-100 cursor-pointer hover:text-blue-800">
            <input
              type="checkbox"
              checked={isAllProductsSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleProductIds])));
                } else {
                  setSelectedProductIds((prev) => prev.filter((id) => !visibleProductIds.includes(id)));
                }
              }}
            />
            <span>Chọn tất cả ({visibleProducts.length})</span>
          </label>

          <div className="space-y-2">
            {visibleProducts.map((product) => {
              const checked = selectedProductIds.includes(product.id);
              return (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds((prev) => [...prev, product.id]);
                      } else {
                        setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={getCloudinaryThumbnailUrl(product.imageUrl, 80, 80)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400">No image</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-800 line-clamp-1 flex-1">{product.name}</span>
                </label>
              );
            })}
            {visibleProducts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">
                Không có sản phẩm trong danh mục này.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsProductPickerOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Xong
            </button>
          </div>
        </div>
      </AppModal>
    </>
  );
}
