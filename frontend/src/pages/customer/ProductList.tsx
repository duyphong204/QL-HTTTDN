import { useEffect, useState, useCallback } from "react";
import ProductGrid from "@/components/Shop/ProductGrid";
import { useProductStore } from "@/stores/product.store";
import { Check, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
const ALL_CATEGORY = "all";
type SortOption = "featured" | "price-low" | "price-high" | "newest";

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
  } = useProductStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoryId") || ALL_CATEGORY;
  const searchFromUrl = searchParams.get("search") || "";
  const maxPriceFromUrlRaw = searchParams.get("maxPrice");
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
      categoryId: categoryIdFromUrl === ALL_CATEGORY ? "" : categoryIdFromUrl,
      search: searchFromUrl,
      maxPrice: maxPriceFromUrl,
      limit: 12,
    });
  }, [activeCategory, searchFromUrl, maxPriceFromUrl, setFilters]);

  useEffect(() => {
    let cancelled = false;

    const loadPriceCeiling = async () => {
      const response = await fetchProductsByQuery({
        categoryId: activeCategory === ALL_CATEGORY ? "" : activeCategory,
        search: searchFromUrl,
        sortBy: "price-high",
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
    { label: "Tất cả danh mục", value: ALL_CATEGORY },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  const sliderMax = Math.max(priceCeiling, maxPriceFromUrl ?? 0);
  const currentMaxSelectedPrice = maxPriceFromUrl ?? sliderMax;

  const totalPages = meta?.totalPages || 1;
  const currentPage = meta?.currentPage ?? filters.page ?? 1;
  const shouldAddBottomSpacer = products.length < 6;

  const totalCount = meta?.totalItems ?? products.length;

  const activeCategoryLabel =
    categoryOptions.find((cat) => cat.value === activeCategory)?.label ||
    "Tất cả danh mục";

  const handleCategoryChange = useCallback(
    (value: string) => {
      const nextParams = new URLSearchParams(searchParams);

      if (value === ALL_CATEGORY) {
        nextParams.delete("categoryId");
      } else {
        nextParams.set("categoryId", value);
      }

      nextParams.delete("maxPrice");

      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleMaxPriceChange = useCallback(
    (value: number) => {
      const nextParams = new URLSearchParams(searchParams);

      if (value >= sliderMax) {
        nextParams.delete("maxPrice");
      } else {
        nextParams.set("maxPrice", String(value));
      }

      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams, sliderMax]
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setFilters({ sortBy: value });
    },
    [setFilters]
  );

  const paginationBtnClass =
    "px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all text-sm sm:text-base font-semibold shadow-sm active:scale-95 disabled:active:scale-100";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filter nhỏ gọn */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <span className="text-blue-600 text-2xl leading-none">≡</span>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Bộ lọc</h2>
            </div>

            <div className="mb-6 lg:mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 lg:mb-4">Danh mục</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 snap-x lg:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`shrink-0 lg:w-full text-left px-4 py-2.5 lg:py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between snap-start ${
                      activeCategory === cat.value
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-1 lg:ring-0"
                        : "bg-gray-100 lg:bg-transparent text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <span className="whitespace-nowrap">{cat.label}</span>
                    {activeCategory === cat.value && (
                      <Check size={16} strokeWidth={3} className="text-white hidden lg:block ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-6 lg:gap-8 items-end lg:items-stretch">
              <div className="w-full">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-bold text-gray-700">Khoảng giá</span>
                  <span className="text-blue-700 font-bold tabular-nums bg-blue-50 px-2 py-1 rounded-md">
                    Dưới {currentMaxSelectedPrice.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  value={currentMaxSelectedPrice}
                  onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-2">
                  <span>0 đ</span>
                  <span>{sliderMax.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.delete("maxPrice");
                  setSearchParams(nextParams);
                  handleCategoryChange(ALL_CATEGORY);
                }}
                className="w-full sm:w-auto lg:w-full shrink-0 border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
              >
                <RefreshCw size={16} />
                <span className="sm:hidden lg:inline">Xóa bộ lọc</span>
                <span className="hidden sm:inline lg:hidden">Xóa lọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            title={`Sản phẩm: ${activeCategoryLabel}`}
            showingCount={true}
            totalCount={totalCount}
            sortBy={(filters.sortBy as SortOption) || "featured"}
            onSortChange={handleSortChange}
          />

          {/* Pagination */}
          <div className="flex flex-wrap justify-center mt-10 gap-2 sm:gap-3">
            <button
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={paginationBtnClass}
            >
              Trước
            </button>

            <span className="px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-sm sm:text-base text-gray-900 bg-blue-50 rounded-xl border border-blue-100 text-center min-w-[120px]">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={paginationBtnClass}
            >
              Sau
            </button>
          </div>

          {shouldAddBottomSpacer && <div className="h-90 sm:h-110" />}
        </div>
      </div>
    </div>
  );
}
