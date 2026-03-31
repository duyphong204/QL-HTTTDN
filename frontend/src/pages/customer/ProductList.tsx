import { useEffect, useState } from 'react';
import ProductGrid from '@/components/Shop/ProductGrid';
import { useProductStore } from '@/store/product.store';
import { Check, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
const ALL_CATEGORY = 'all';
type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

export default function ProductList() {
  const {
    products,
    categories,
    meta,
    filters,
    fetchCategories,
    fetchProductsByQuery,
    setPage,
    setFilters,
  } =
    useProductStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('categoryId') || ALL_CATEGORY;
  const searchFromUrl = searchParams.get('search') || '';
  const maxPriceFromUrlRaw = searchParams.get('maxPrice');
  const maxPriceFromUrl =
    maxPriceFromUrlRaw && !Number.isNaN(Number(maxPriceFromUrlRaw))
      ? Number(maxPriceFromUrlRaw)
      : undefined;
  const [priceCeiling, setPriceCeiling] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const categoryIdFromUrl = activeCategory;

    setFilters({
      categoryId: categoryIdFromUrl === ALL_CATEGORY ? '' : categoryIdFromUrl,
      search: searchFromUrl,
      maxPrice: maxPriceFromUrl,
    });
  }, [activeCategory, searchFromUrl, maxPriceFromUrl, setFilters]);

  useEffect(() => {
    let cancelled = false;

    const loadPriceCeiling = async () => {
      const response = await fetchProductsByQuery({
        categoryId: activeCategory === ALL_CATEGORY ? '' : activeCategory,
        search: searchFromUrl,
        sortBy: 'price-high',
        page: 1,
        limit: 1,
      });

      if (cancelled) {
        return;
      }

      const highestPrice = response?.data?.[0]?.price ?? 0;
      setPriceCeiling(highestPrice);
    };

    loadPriceCeiling();

    return () => {
      cancelled = true;
    };
  }, [activeCategory, fetchProductsByQuery, searchFromUrl]);

  const categoryOptions = [
    { label: 'Tất cả', value: ALL_CATEGORY },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  const sliderMax = Math.max(priceCeiling, maxPriceFromUrl ?? 0);
  const currentMaxSelectedPrice = maxPriceFromUrl ?? sliderMax;

  const totalPages = meta?.totalPages || 1;
  const currentPage = filters.page || 1;
  const shouldAddBottomSpacer = products.length < 6;

  const totalCount = meta?.total ?? products.length;

  const activeCategoryLabel =
    categoryOptions.find((cat) => cat.value === activeCategory)?.label ||
    'Tất cả';

  const handleCategoryChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === ALL_CATEGORY) {
      nextParams.delete('categoryId');
    } else {
      nextParams.set('categoryId', value);
    }

    nextParams.delete('maxPrice');

    setSearchParams(nextParams);
  };

  const handleMaxPriceChange = (value: number) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value >= sliderMax) {
      nextParams.delete('maxPrice');
    } else {
      nextParams.set('maxPrice', String(value));
    }

    setSearchParams(nextParams);
  };

  const handleSortChange = (value: SortOption) => {
    setFilters({ sortBy: value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filter nhỏ gọn */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-600 text-2xl">≡</span> Bộ lọc
            </h2>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide"></h3>
              <div className="space-y-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                      activeCategory === cat.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {activeCategory === cat.value && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-medium text-gray-700">Giá tối đa</span>
                <span className="text-blue-700 font-semibold">
                  {currentMaxSelectedPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={sliderMax}
                value={currentMaxSelectedPrice}
                onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0 đ</span>
                <span>{sliderMax.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <button
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('maxPrice');
                setSearchParams(nextParams);
                handleCategoryChange(ALL_CATEGORY);
              }}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <ProductGrid 
            products={products} 
            title={`Sản phẩm: ${activeCategoryLabel}`} 
            showingCount={true} 
            totalCount={totalCount}
            sortBy={(filters.sortBy as SortOption) || 'featured'}
            onSortChange={handleSortChange}
          />

          {/* Pagination */}
          <div className="flex flex-wrap justify-center mt-10 gap-2 sm:gap-3">
            <button
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-sm sm:text-base font-medium"
            >
              Prev
            </button>

            <span className="px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base text-gray-900 bg-gray-50 rounded-xl border border-gray-200 text-center">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition text-sm sm:text-base font-medium"
            >
              Next
            </button>
          </div>

          {shouldAddBottomSpacer && <div className="h-90 sm:h-110" />}
        </div>
      </div>
    </div>
  );
}