import ProductCard from './ProductCard';
import type { Product } from '@/types/warehouse.type';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showingCount?: boolean;
  totalCount?: number;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'newest';
  onSortChange?: (value: 'featured' | 'price-low' | 'price-high' | 'newest') => void;
}

export default function ProductGrid({
  products,
  title = "Danh sách sản phẩm",
  showingCount = true,
  totalCount,
  sortBy = 'featured',
  onSortChange,
}: ProductGridProps) {
  return (
    <div className="space-y-8">
      {/* Tiêu đề + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          {showingCount && (
            <p className="text-sm text-gray-600 mt-1">
              Hiển thị {totalCount ?? products.length} sản phẩm
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">Sắp xếp theo:</span>
          <div className="relative inline-block min-w-[180px]">
            <select
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition cursor-pointer shadow-sm w-full"
              value={sortBy}
              onChange={(e) =>
                onSortChange?.(
                  e.target.value as
                    | 'featured'
                    | 'price-low'
                    | 'price-high'
                    | 'newest',
                )
              }
            >
              <option value="featured">Nổi bật</option>
              <option value="price-low">Giá thấp → cao</option>
              <option value="price-high">Giá cao → thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 4 cột ở màn lớn để hiển thị gọn hơn */}
      <div className="
        grid 
        grid-cols-2
        md:grid-cols-3
        xl:grid-cols-4
        gap-4 sm:gap-5
      ">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😔</span>
          </div>
          <p className="text-lg font-medium text-gray-700">Không tìm thấy sản phẩm nào</p>
          <p className="text-sm mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm khác nhé!</p>
        </div>
      )}
    </div>
  );
}