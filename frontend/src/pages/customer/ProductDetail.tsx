import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Product } from "@/types/warehouse.type";
import { ArrowLeft, ShoppingCart, Plus, Minus, Check, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useProductStore } from "@/stores/product.store";
import { toast } from "sonner";
import {
  getEffectiveProductPrice,
  getProductDiscountPercent,
  hasProductSale,
} from "@/lib/pricing";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { fetchProductById, fetchProductsByQuery } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const cartQuantity = useCartStore((state) =>
    product
      ? (state.items.find((item) => item.id === product.id)?.quantity ?? 0)
      : 0,
  );
  const availableToAdd = useMemo(
    () => Math.max(0, (product?.stockQuantity ?? 0) - cartQuantity),
    [cartQuantity, product?.stockQuantity],
  );
  const isOutOfStock = availableToAdd <= 0;
  const currentPrice = product ? getEffectiveProductPrice(product) : 0;
  const hasSale = product ? hasProductSale(product) : false;
  const discountPercent = product
    ? getProductDiscountPercent(product, currentPrice)
    : 0;

  useEffect(() => {
    if (availableToAdd <= 0) {
      return;
    }

    setQuantity((current) => Math.min(Math.max(1, current), availableToAdd));
  }, [availableToAdd]);

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const res = await fetchProductById(id);
        if (!cancelled) {
          setProduct(res);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id, fetchProductById]);

  useEffect(() => {
    let cancelled = false;

    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const sameCategory = await fetchProductsByQuery({
          categoryId: product.categoryId,
          limit: 6,
          page: 1,
        });

        let related = (sameCategory?.data ?? []).filter(
          (item) => item.id !== product.id,
        );

        if (related.length < 5) {
          const fallback = await fetchProductsByQuery({
            limit: 10,
            page: 1,
            sortBy: "newest",
          });

          const fallbackItems = (fallback?.data ?? []).filter(
            (item) =>
              item.id !== product.id && !related.some((r) => r.id === item.id),
          );

          related = [...related, ...fallbackItems];
        }

        if (!cancelled) {
          setRelatedProducts(related.slice(0, 5));
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
        if (!cancelled) {
          setRelatedProducts([]);
        }
      }
    };

    fetchRelatedProducts();
    return () => {
      cancelled = true;
    };
  }, [product, fetchProductsByQuery]);

  const addSelectedQuantityToCart = (targetProduct: Product) => {
    if (availableToAdd <= 0) {
      toast.error("Sản phẩm đã đạt số lượng tối đa trong giỏ hàng");
      return;
    }

    const quantityToAdd = Math.min(quantity, availableToAdd);

    const cartProduct = hasSale
      ? { ...targetProduct, price: currentPrice }
      : targetProduct;
    addToCart(cartProduct, quantityToAdd);
    toast.success("Đã thêm vào giỏ hàng");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-in fade-in duration-500 bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 text-center animate-in fade-in duration-500 bg-white">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
          <span className="text-4xl opacity-50">🔍</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-500 text-sm">
            Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không hợp lệ.
          </p>
        </div>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium px-6 py-2.5 rounded-lg transition-all"
        >
          <ArrowLeft size={18} />
          Trở về cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 animate-in fade-in duration-500">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-semibold text-gray-400 mb-8 sm:mb-10 uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <span className="text-gray-300">/</span>
          <Link to="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
          <span className="text-gray-300">/</span>
          <span className="text-blue-600 truncate max-w-[200px] sm:max-w-md">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Cột trái: Hình ảnh */}
          <div className="w-full lg:w-[45%] flex-shrink-0 sticky top-28">
            <div className="relative aspect-square rounded-[2.5rem] bg-gradient-to-b from-gray-50 to-white border border-gray-100 flex items-center justify-center p-12 group overflow-hidden shadow-2xl shadow-gray-200/40">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <img
                src={
                  product.imageUrl ||
                  "https://via.placeholder.com/800x800?text=TechStore"
                }
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
                fetchPriority="high"
                decoding="async"
              />

              {hasSale && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-red-500 text-white text-sm font-black px-4 py-2 rounded-xl shadow-lg shadow-red-500/30 tracking-wide">
                    GIẢM {discountPercent}%
                  </span>
                </div>
              )}
              
              {isOutOfStock && (
                <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-gray-900 text-white font-black tracking-widest px-8 py-3 rounded-2xl shadow-xl">
                    ĐÃ HẾT HÀNG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="w-full lg:w-[55%] flex flex-col pt-2">
            {/* Tiêu đề & Danh mục */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[13px] font-bold uppercase tracking-wider mb-4 rounded-lg">
                {product.category?.name || "Danh mục chung"}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                {product.name}
              </h1>
            </div>

            {/* Giá cả */}
            <div className="mb-8 flex items-baseline gap-4">
              <span className="text-4xl sm:text-5xl font-black text-blue-600 tabular-nums tracking-tighter">
                {currentPrice?.toLocaleString("vi-VN")} ₫
              </span>
              {hasSale && (
                <span className="text-xl sm:text-2xl text-gray-400 line-through tabular-nums font-semibold">
                  {product.price?.toLocaleString("vi-VN")} ₫
                </span>
              )}
            </div>

            {/* Trạng thái & Ưu đãi nhỏ */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Check size={18} className="text-emerald-500" strokeWidth={2.5} />
                <span className="text-gray-700">Tình trạng: 
                  <strong className={product.stockQuantity && product.stockQuantity > 0 ? "text-emerald-600 ml-1 font-semibold" : "text-red-500 ml-1 font-semibold"}>
                    {product.stockQuantity && product.stockQuantity > 0 ? `Còn hàng (${product.stockQuantity})` : "Hết hàng"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-8 w-full"></div>

            {/* Form chọn mua */}
            <div className="mb-10 flex flex-col sm:flex-row gap-4 items-stretch">
              {/* Chọn số lượng */}
              <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl bg-white w-full sm:w-36 h-14 px-1 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
                <span className="text-lg font-bold text-gray-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= availableToAdd || isOutOfStock}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Nút Thêm */}
              <button
                onClick={() => addSelectedQuantityToCart(product)}
                disabled={isOutOfStock}
                className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 transition-all"
              >
                <ShoppingCart size={22} strokeWidth={2.5} />
                {isOutOfStock ? "ĐÃ HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
              </button>
            </div>
            
            {/* Chú thích nếu giỏ hàng đã có */}
            {!isOutOfStock && availableToAdd < product.stockQuantity! && (
              <p className="text-sm text-gray-500 mt-[-1.5rem] mb-8 italic">
                *Đã có {cartQuantity} sản phẩm trong giỏ hàng.
              </p>
            )}

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100 mb-10">
              {[
                {
                  icon: ShieldCheck,
                  title: "Bảo hành chính hãng",
                  desc: "Thời hạn 12 tháng",
                },
                {
                  icon: RefreshCw,
                  title: "Đổi trả miễn phí",
                  desc: "Trong vòng 15 ngày",
                },
                {
                  icon: Truck,
                  title: "Giao hàng tận nơi",
                  desc: "Miễn phí từ 500k",
                },
                {
                  icon: Check,
                  title: "Kiểm tra khi nhận",
                  desc: "An tâm mua sắm",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <feature.icon
                    className="text-blue-600 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {feature.title}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mô tả chi tiết */}
            <div className="mt-2">
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                Thông tin chi tiết
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p>
                    Thiết kế tinh tế, hiệu năng ổn định, đáp ứng hoàn hảo các nhu cầu sử dụng trong phân khúc. Đây là sản phẩm đang được ưa chuộng tại TechStore với chế độ hậu mãi tận tâm.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <div className="bg-slate-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  Sản phẩm cùng danh mục
                </h2>
                <p className="text-gray-500 mt-2 font-medium">Khám phá thêm các lựa chọn tương tự</p>
              </div>
              <Link to={`/products?categoryId=${product.categoryId}`} className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">
                Xem tất cả &rarr;
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="aspect-square bg-white flex items-center justify-center p-6 relative">
                    {hasProductSale(item) && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Giảm giá
                      </span>
                    )}
                    <img
                      src={
                        item.imageUrl ||
                        "https://via.placeholder.com/300x300?text=TechStore"
                      }
                      alt={item.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow border-t border-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors min-h-[40px]">
                      {item.name}
                    </h4>
                    <div className="mt-auto">
                      <p className="text-base font-bold text-blue-600 tabular-nums">
                        {getEffectiveProductPrice(item).toLocaleString("vi-VN")} ₫
                      </p>
                      {hasProductSale(item) && (
                         <p className="text-xs text-gray-400 line-through tabular-nums mt-0.5">
                           {item.price.toLocaleString("vi-VN")} ₫
                         </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
