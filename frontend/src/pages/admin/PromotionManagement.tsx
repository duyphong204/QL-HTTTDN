import { useEffect, useMemo, useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { usePromotionStore } from '@/store/promotion.store';
import { useProductStore } from '@/store/product.store';
import type { PromotionType } from '@/types/promotion.type';

export default function PromotionManagement() {
  const {
    promotions,
    isLoading,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    setPromotionProducts,
  } = usePromotionStore();
  const { fetchProductsByQuery } = useProductStore();
  const [allProducts, setAllProducts] = useState<Array<{ id: string; name: string }>>([]);

  const [name, setName] = useState('');
  const [type, setType] = useState<PromotionType>('PERCENT');
  const [value, setValue] = useState<number>(10);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setType('PERCENT');
    setValue(10);
    setStartAt('');
    setEndAt('');
    setIsActive(true);
    setSelectedProductIds([]);
    setEditingPromotionId(null);
  };

  const toDateTimeLocalValue = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    const loadProducts = async () => {
      const response = await fetchProductsByQuery({ page: 1, limit: 300, sortBy: 'name' });
      setAllProducts((response?.data ?? []).map((p) => ({ id: p.id, name: p.name })));
    };

    loadProducts();
  }, [fetchProductsByQuery]);

  const activeCount = useMemo(
    () => promotions.filter((promotion) => promotion.isActive).length,
    [promotions],
  );

  const handleSave = async () => {
    const payload = {
      name,
      type,
      value,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      isActive,
    };

    if (type === 'PERCENT' && value > 100) {
      return;
    }

    if (editingPromotionId) {
      await updatePromotion(editingPromotionId, payload);
      await setPromotionProducts(editingPromotionId, selectedProductIds);
      resetForm();
      return;
    }

    await createPromotion({
      ...payload,
      productIds: selectedProductIds,
    });
    resetForm();
  };

  const startEdit = (promotion: (typeof promotions)[number]) => {
    setEditingPromotionId(promotion.id);
    setName(promotion.name);
    setType(promotion.type);
    setValue(promotion.value);
    setStartAt(toDateTimeLocalValue(promotion.startAt));
    setEndAt(toDateTimeLocalValue(promotion.endAt));
    setIsActive(promotion.isActive);
    setSelectedProductIds(promotion.products.map((link) => link.productId));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="text-blue-600" size={26} /> Quan ly chuong trinh khuyen mai
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tao chuong trinh, gan san pham va dong bo gia giam len trang shop
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm text-gray-700">
            Dang hoat dong: <span className="font-semibold text-blue-700">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingPromotionId ? 'Chinh sua chuong trinh' : 'Tao chuong trinh moi'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ten chuong trinh"
              className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromotionType)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="PERCENT">Giam theo %</option>
              <option value="FIXED">Giam theo so tien</option>
            </select>
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              placeholder="Gia tri giam"
              className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <label className="h-10 px-3 text-sm border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Kich hoat ngay
            </label>
          </div>
          {type === 'PERCENT' && value > 100 ? (
            <p className="text-sm text-red-600">Gia tri giam theo % khong duoc lon hon 100.</p>
          ) : null}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Gan san pham</p>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {allProducts.map((product) => {
                const checked = selectedProductIds.includes(product.id);
                return (
                  <label key={product.id} className="flex items-center gap-2 text-sm text-gray-700">
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
                    <span className="line-clamp-1">{product.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!name.trim() || (type === 'PERCENT' && value > 100)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={16} /> {editingPromotionId ? 'Luu thay doi' : 'Tao chuong trinh'}
            </button>
            {editingPromotionId ? (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Huy
              </button>
            ) : null}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Danh sach chuong trinh</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Ten chuong trinh</th>
                  <th className="px-6 py-4">Kieu</th>
                  <th className="px-6 py-4">Gia tri</th>
                  <th className="px-6 py-4">So san pham</th>
                  <th className="px-6 py-4">Trang thai</th>
                  <th className="px-6 py-4">Hanh dong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Dang tai...</td>
                  </tr>
                ) : promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Chua co chuong trinh nao.</td>
                  </tr>
                ) : (
                  promotions.map((promotion) => (
                    <tr key={promotion.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{promotion.name}</td>
                      <td className="px-6 py-4 text-gray-600">{promotion.type === 'PERCENT' ? 'Phan tram' : 'So tien'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {promotion.type === 'PERCENT'
                          ? `${promotion.value}%`
                          : `${promotion.value.toLocaleString('vi-VN')} đ`}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{promotion.products.length}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            promotion.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {promotion.isActive ? 'Dang bat' : 'Dang tat'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => startEdit(promotion)}
                          className="text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
                        >
                          Sua
                        </button>
                        <button
                          onClick={() =>
                            updatePromotion(promotion.id, {
                              isActive: !promotion.isActive,
                            })
                          }
                          className="ml-2 text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          {promotion.isActive ? 'Tat' : 'Bat'}
                        </button>
                        <button
                          onClick={() =>
                            setPromotionProducts(
                              promotion.id,
                              promotion.products.map((link) => link.productId),
                            )
                          }
                          className="ml-2 text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
                        >
                          Dong bo san pham
                        </button>
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
  );
}
