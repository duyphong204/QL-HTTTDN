import { Link } from "react-router-dom";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types/warehouse.type";
import { toast } from "sonner";
import {
  getEffectiveProductPrice,
  getProductDiscountPercent,
  hasProductSale,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

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
  const cartQuantity = useCartStore(
    (state) =>
      state.items.find((item) => item.id === product.id)?.quantity ?? 0,
  );
  const remainingStock = Math.max(
    0,
    (product.stockQuantity ?? 0) - cartQuantity,
  );
  const isOutOfStock = remainingStock <= 0;
  const effectiveDiscountPercent =
    discountPercent || product.discountPercent || 0;
  const effectivePrice = getEffectiveProductPrice(product, priceOverride);
  const shouldShowOriginalPrice =
    showOriginalPrice ||
    hasProductSale(product) ||
    effectivePrice < product.price;
  const computedDiscountPercent = getProductDiscountPercent(
    product,
    effectivePrice,
  );

  const finalDiscountPercent = effectiveDiscountPercent || computedDiscountPercent;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("Sản phẩm đã đạt số lượng tối đa trong giỏ hàng");
      return;
    }
    addToCart({ ...product, price: effectivePrice });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 hover:-translate-y-1 h-full relative"
    >
      {/* Ảnh */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden flex items-center justify-center p-6">
        {finalDiscountPercent > 0 && (
          <span className="absolute top-3 left-3 z-10 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-white shadow-md shadow-red-500/20">
            Giảm {finalDiscountPercent}%
          </span>
        )}
        <img
          src={
            product.imageUrl || "https://via.placeholder.com/400?text=TechStore"
          }
          alt={product.name}
          className="object-contain max-w-full max-h-full transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Quick action overlay (chi hiện khi không phải compact) */}
        {!compactAddToCart && !isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
            <button
              onClick={handleAddToCart}
              className="w-full bg-white/90 backdrop-blur-md hover:bg-blue-600 text-gray-900 hover:text-white font-bold py-2.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              Mua ngay
            </button>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white z-10">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[44px]">
          {product.name}
        </h3>

        {/* Giá tiền */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="text-base sm:text-lg font-black text-blue-600 tabular-nums">
              {effectivePrice?.toLocaleString("vi-VN")} ₫
            </p>
            {shouldShowOriginalPrice && effectivePrice < product.price && (
              <p className="text-xs font-bold text-gray-400 line-through mt-0.5 tabular-nums">
                {product.price?.toLocaleString("vi-VN")} ₫
              </p>
            )}
          </div>

          {compactAddToCart && (
            <button
              type="button"
              aria-label={
                isOutOfStock
                  ? "Đã hết hàng"
                  : "Thêm vào giỏ"
              }
              disabled={isOutOfStock}
              className={cn(
                "h-9 w-9 rounded-full transition-all flex items-center justify-center shrink-0",
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md"
              )}
              onClick={handleAddToCart}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        {/* Nút báo hết hàng cho thẻ bình thường */}
        {!compactAddToCart && isOutOfStock && (
          <div className="mt-4 text-center py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg">
            ĐÃ HẾT HÀNG
          </div>
        )}
      </div>
    </Link>
  );
}
