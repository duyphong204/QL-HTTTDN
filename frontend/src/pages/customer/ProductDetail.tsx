import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product } from '@/types/warehouse.type';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useProductStore } from '@/store/product.store';


export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { fetchProductById, fetchProductsByQuery } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const isOutOfStock = (product?.stockQuantity ?? 0) <= 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const res = await fetchProductById(id);
        setProduct(res);
      } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm:', error);
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

        let related = (sameCategory?.data ?? []).filter((item) => item.id !== product.id);

        if (related.length < 4) {
          const fallback = await fetchProductsByQuery({
            limit: 12,
            page: 1,
            sortBy: 'newest',
          });

          const fallbackItems = (fallback?.data ?? []).filter(
            (item) => item.id !== product.id && !related.some((r) => r.id === item.id),
          );

          related = [...related, ...fallbackItems];
        }

        setRelatedProducts(related.slice(0, 4));
      } catch (error) {
        console.error('Lỗi lấy sản phẩm liên quan:', error);
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [product, fetchProductsByQuery]);

  const addSelectedQuantityToCart = (targetProduct: Product) => {
    if (targetProduct.stockQuantity <= 0) {
      return;
    }

    addToCart(targetProduct, quantity);
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
        <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-600">Sản phẩm có thể đã bị xóa hoặc không còn khả dụng.</p>
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
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x600?text=TechStore'}
            alt={product.name}
            className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
          />

          {/* Badge giảm giá giả lập (nếu muốn thêm sau thì dùng product.discount) */}
          {/* <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
            -10% OFF
          </span> */}
        </div>

        {/* Phần thông tin bên phải */}
<div className="flex flex-col">
  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
    {product.name}
  </h1>

  {/* Giá sản phẩm */}
  <div className="mt-4 flex items-baseline gap-3">
    <span className="text-4xl sm:text-5xl font-bold text-blue-600">
      {product.price?.toLocaleString('vi-VN')} đ
    </span>
  </div>

  {/* Mô tả */}
  <p className="mt-6 text-gray-700 leading-relaxed text-lg">
    {product.description || 'Sản phẩm chất lượng cao từ TechStore – bảo hành chính hãng, giao hàng nhanh chóng.'}
  </p>

  {/* Nút hành động */}
  <div className="mt-8">
    <button 
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
      onClick={() => addSelectedQuantityToCart(product)}
      disabled={isOutOfStock}
    >
      <ShoppingCart size={22} />
      {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
    </button>
  </div>

  {/* Chọn số lượng - đã chỉnh nhỏ gọn tối đa */}
  <div className="mt-6">
    <span className="block text-sm font-medium text-gray-600 mb-1.5">Số lượng</span>
    
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white w-fit">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        <Minus size={16} />
      </button>
      
      <span className="px-5 py-2 font-semibold text-base text-gray-900 min-w-[42px] text-center border-x border-gray-300">
        {quantity}
      </span>
      
      <button
        onClick={() => setQuantity(quantity + 1)}
        disabled={quantity >= (product.stockQuantity ?? 0)}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>

    <p className="text-xs text-gray-500 mt-1">
      Còn {product.stockQuantity ?? 0} sản phẩm
    </p>
  </div>

  {/* Thông tin bổ sung */}
  <div className="mt-12 border-t border-gray-200 pt-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
      <div>
        <span className="font-medium">Danh mục:</span> {product.category?.name || 'Đang cập nhật'}
      </div>
      <div>
        <span className="font-medium">Số lượng tồn kho:</span> {product.stockQuantity ?? 0} sản phẩm
      </div>
      <div>
        <span className="font-medium">Giao hàng:</span> Miễn phí toàn quốc (đơn từ 500k)
      </div>
      <div>
        <span className="font-medium">Bảo hành:</span> 12 tháng chính hãng
      </div>
    </div>
  </div>
</div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/300x300?text=Product'}
                    alt={item.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">{item.name}</h4>
                  <p className="text-blue-600 font-bold mt-2">{item.price.toLocaleString('vi-VN')} đ</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}