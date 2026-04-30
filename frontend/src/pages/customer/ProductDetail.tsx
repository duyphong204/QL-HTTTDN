import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Product } from "@/types/warehouse.type";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
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
    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const res = await fetchProductById(id);
        setProduct(res);
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, fetchProductById]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const sameCategory = await fetchProductsByQuery({
          categoryId: product.categoryId,
          limit: 8,
          page: 1,
        });

        let related = (sameCategory?.data ?? []).filter(
          (item) => item.id !== product.id,
        );

        if (related.length < 4) {
          const fallback = await fetchProductsByQuery({
            limit: 12,
            page: 1,
            sortBy: "newest",
          });

          const fallbackItems = (fallback?.data ?? []).filter(
            (item) =>
              item.id !== product.id && !related.some((r) => r.id === item.id),
          );

          related = [...related, ...fallbackItems];
        }

        setRelatedProducts(related.slice(0, 4));
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-gray-600">
          Sản phẩm có thể đã bị xóa hoặc không còn khả dụng.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
        >
          <ArrowLeft size={18} />
          Quay về danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Nút Back */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Quay lại
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Phần ảnh lớn */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
          <img
            src={
              product.imageUrl ||
              "https://via.placeholder.com/600x600?text=TechStore"
            }
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
          />

          {/* Badge giảm giá giả lập (nếu muốn thêm sau thì dùng product.discount) */}
          {/* <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
            -10% OFF
          </span> */}
        </div>

        {/* Phần thông tin bên phải */}
        <div className="flex flex-col max-w-2xl">
          {/* Tên sản phẩm */}
          <h1 className="text-xl font-semibold text-gray-900 leading-tight mb-5">
            {product.name}
          </h1>

          {/* Giá sản phẩm */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
              {currentPrice?.toLocaleString("vi-VN")} đ
            </span>

            {hasSale && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  {product.price?.toLocaleString("vi-VN")} đ
                </span>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Mô tả */}
          <p className="mt-5 text-gray-600 leading-relaxed text-[15px]">
            {product.description ||
              "Sản phẩm chất lượng cao từ TechStore – bảo hành chính hãng, giao hàng nhanh chóng."}
          </p>

          {/* Phần tương tác: Số lượng & Nút bấm */}
          <div className="mt-8 space-y-6">
            {/* Chọn số lượng */}
            <div>
              <span className="block text-sm font-medium text-gray-600 mb-2">
                Số lượng
              </span>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white w-fit shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-4 py-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Minus size={16} />
                </button>

                <span className="px-6 py-2 font-semibold text-base text-gray-900 min-w-[50px] text-center border-x border-gray-200">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= availableToAdd}
                  className="px-4 py-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Còn <strong>{product.stockQuantity ?? 0}</strong> sản phẩm trong
                kho, có thể thêm <strong>{availableToAdd}</strong>
              </p>
            </div>

            {/* Nút hành động - Đã thu gọn chiều rộng cho cân đối */}
            <div className="flex gap-4">
              <button
                className="min-w-[240px] sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed 
                          text-white font-semibold text-[15px] 
                          py-3.5 px-10 rounded-2xl 
                          flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                onClick={() => addSelectedQuantityToCart(product)}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin sản phẩm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
              <div>
                <span className="font-medium text-gray-500">Danh mục:</span>{" "}
                {product.category?.name || "Đang cập nhật"}
              </div>
              <div>
                <span className="font-medium text-gray-500">Tồn kho:</span>{" "}
                {product.stockQuantity ?? 0} sản phẩm
              </div>
              <div>
                <span className="font-medium text-gray-500">Giao hàng:</span>{" "}
                Miễn phí toàn quốc (đơn từ 500k)
              </div>
              <div>
                <span className="font-medium text-gray-500">Bảo hành:</span> 12
                tháng chính hãng
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      "https://via.placeholder.com/300x300?text=Product"
                    }
                    alt={item.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                    {item.name}
                  </h4>
                  <p className="text-blue-600 font-bold mt-2">
                    {getEffectiveProductPrice(item).toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
