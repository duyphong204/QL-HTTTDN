import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import type { Product } from '@/types/warehouse.type';
import ProductCard from '@/components/Shop/ProductCard';
import heroBannerImage from '@/assets/Panner.jpg';
import { useProductStore } from '@/store/product.store';

const HERO_BANNER_IMAGE =
  heroBannerImage;

export default function ShopHome() {
  const { fetchCategories, fetchProductsByQuery, categories } = useProductStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashProducts, setFlashProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoading(true);
      try {
        await fetchCategories();

        const [featuredRes, flashRes] = await Promise.all([
          fetchProductsByQuery({ page: 1, limit: 8, sortBy: 'newest' }),
          fetchProductsByQuery({ page: 1, limit: 24, sortBy: 'newest' }),
        ]);

        setFeaturedProducts(featuredRes?.data ?? []);
        setFlashProducts((flashRes?.data ?? []).filter((item) => item.isOnSale));
        setTotalProducts(featuredRes?.meta?.total ?? 0);
      } catch {
        setFeaturedProducts([]);
        setFlashProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [fetchCategories, fetchProductsByQuery]);

  const categoryBlocks = useMemo(() => {
    const palette = [
      'bg-blue-100 hover:bg-blue-200',
      'bg-cyan-100 hover:bg-cyan-200',
      'bg-sky-100 hover:bg-sky-200',
      'bg-indigo-100 hover:bg-indigo-200',
      'bg-emerald-100 hover:bg-emerald-200',
      'bg-amber-100 hover:bg-amber-200',
    ];

    return categories.map((cat, index) => ({
      ...cat,
      color: palette[index % palette.length],
    }));
  }, [categories]);

  const flashSaleItems = useMemo(() => {
    return flashProducts.slice(0, 4);
  }, [flashProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Hero */}
      <section className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 bg-gradient-to-br from-blue-950 via-indigo-950 to-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        </div>

        <div className="relative container mx-auto px-6 py-24 md:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Công nghệ chính hãng <br />
              <span className="text-blue-500">cho cuộc sống hiện đại</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-xl mx-auto lg:mx-0">
              Khám phá phụ kiện mới nhất với mức giá hợp lý,
              bảo hành rõ ràng và hỗ trợ nhanh chóng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-blue-700 hover:bg-blue-600 text-white font-bold text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Mua sắm ngay
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-lg px-10 py-5 rounded-full border border-white/30 transition-all duration-300"
              >
                Xem bộ sưu tập
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-10 mt-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-400">{totalProducts}+</p>
                <p className="text-gray-400">Sản phẩm</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-400">50K+</p>
                <p className="text-gray-400">Khách hàng hài lòng</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-400">4.8★</p>
                <p className="text-gray-400">Đánh giá trung bình</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-3xl blur-3xl"></div>
              <img
                src={HERO_BANNER_IMAGE}
                alt="Banner công nghệ"
                className="relative rounded-3xl shadow-2xl border border-gray-700/50 object-cover w-full h-auto transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Danh mục */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Mua sắm theo danh mục
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Chọn đúng nhóm sản phẩm bạn đang cần
          </p>

          {isLoading ? (
            <div className="flex flex-wrap justify-center gap-5 sm:gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 sm:h-40 w-[150px] sm:w-[180px] lg:w-[200px] rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : categoryBlocks.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-5 sm:gap-6 max-w-6xl mx-auto">
              {categoryBlocks.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  className={`flex h-36 sm:h-40 w-[150px] sm:w-[180px] lg:w-[200px] flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${cat.color}`}
                >
                  <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-3">
                    {cat.name.slice(0, 1).toUpperCase()}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center line-clamp-2">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600 max-w-2xl mx-auto">
              Chưa có danh mục để hiển thị.
            </div>
          )}
        </div>
      </section>

      {/* Banner Flash Sale */}
      {!isLoading && flashSaleItems.length > 0 ? (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="relative overflow-hidden rounded-3xl bg-[#fff1e6] px-6 py-10 sm:px-8 md:py-12 border border-orange-100 shadow-sm">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80')] bg-repeat"></div>

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                  <div>
                    <div className="inline-flex items-center gap-3 bg-red-600 text-white px-5 py-2 rounded-full font-bold text-lg">
                      <Zap size={24} fill="white" />
                      Flash Sale
                    </div>
                    <p className="text-gray-700 mt-2 font-medium">Ưu đãi có thời hạn - đừng bỏ lỡ!</p>
                  </div>
                  <Link to="/products" className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2">
                    Xem tất cả <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
                  {flashSaleItems.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      compactAddToCart
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Sản phẩm nổi bật */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
            <Link to="/products" className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-2">
              Xem tất cả <ArrowRight size={18} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-80 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} compactAddToCart />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
              Chưa có sản phẩm nổi bật.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}