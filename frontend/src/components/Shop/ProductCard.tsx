import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import type { Product } from '@/types/warehouse.type';

interface ProductCardProps {
  product: Product;
  discountPercent?: number;
  priceOverride?: number;
  showOriginalPrice?: boolean;
  compactAddToCart?: boolean;
}

export default function ProductCard({
  product,
  discountPercent = 0,
  priceOverride,
  showOriginalPrice = false,
  compactAddToCart = false,
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const isOutOfStock = product.stockQuantity <= 0;
  const effectivePrice =
    typeof priceOverride === 'number' && priceOverride > 0
      ? priceOverride
      : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, price: effectivePrice });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 hover:border-blue-300 h-full"
    >
      {/* Ảnh */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400?text=TechStore'}
          alt={product.name}
          className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Nội dung */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[2.75rem]">
          {product.name}
        </h3>

        {/* Giá tiền gọn hơn */}
        <div className="mb-4 mt-auto">
          {compactAddToCart ? (
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {effectivePrice?.toLocaleString('vi-VN')} ₫
                </p>
                {showOriginalPrice && effectivePrice < product.price && (
                  <p className="text-sm text-gray-500 line-through mt-1">
                    {product.price?.toLocaleString('vi-VN')} ₫
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label={isOutOfStock ? 'Sản phẩm đã hết hàng' : 'Thêm vào giỏ hàng'}
                disabled={isOutOfStock}
                className={`h-10 w-10 rounded-full border transition-colors flex items-center justify-center ${
                  isOutOfStock
                    ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-lg sm:text-xl font-bold text-blue-600">
                {effectivePrice?.toLocaleString('vi-VN')} ₫
              </p>
              {showOriginalPrice && effectivePrice < product.price && (
                <p className="text-sm text-gray-500 line-through mt-1">
                  {product.price?.toLocaleString('vi-VN')} ₫
                </p>
              )}
            </>
          )}
        </div>

        {!compactAddToCart && (
          <button
            disabled={isOutOfStock}
            className={`w-full font-medium text-xs sm:text-base py-2 sm:py-3 px-2 sm:px-3 rounded-md sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:scale-[0.98]'
            }`}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={16} className="sm:h-[18px] sm:w-[18px]" />
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        )}
      </div>
    </Link>
  );
}