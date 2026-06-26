import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import type { Product } from "@/types/warehouse.type";
import ProductCard from "@/components/Shop/ProductCard";
import heroBannerImage from "@/assets/Panner.jpg";
import { useProductStore } from "@/stores/product.store";

const HERO_BANNER_IMAGE = heroBannerImage;

export default function ShopHome() {
  const { fetchCategories, fetchProductsByQuery, categories } =
    useProductStore();
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
          fetchProductsByQuery({ page: 1, limit: 18, sortBy: "newest" }),
          fetchProductsByQuery({ page: 1, limit: 24, sortBy: "newest" }),
        ]);

        setFeaturedProducts(featuredRes?.data ?? []);
        setFlashProducts(
          (flashRes?.data ?? []).filter((item) => item.isOnSale),
        );
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
      "from-blue-50 to-indigo-50 text-blue-700 hover:shadow-blue-500/20",
      "from-emerald-50 to-teal-50 text-emerald-700 hover:shadow-emerald-500/20",
      "from-purple-50 to-fuchsia-50 text-purple-700 hover:shadow-purple-500/20",
      "from-amber-50 to-orange-50 text-amber-700 hover:shadow-amber-500/20",
      "from-rose-50 to-pink-50 text-rose-700 hover:shadow-rose-500/20",
      "from-cyan-50 to-sky-50 text-cyan-700 hover:shadow-cyan-500/20",
    ];

    return categories.map((cat, index) => ({
      ...cat,
      color: palette[index % palette.length],
    }));
  }, [categories]);

  const flashSaleItems = useMemo(() => {
    return flashProducts.slice(0, 6);
  }, [flashProducts]);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-200">
      {/* Banner Hero */}
      <section className="relative px-4 sm:px-6 pt-6 pb-12 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-gray-950 overflow-hidden shadow-2xl">
          {/* Background gradient & pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-900 to-blue-950"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative px-6 py-16 sm:px-12 sm:py-24 lg:px-16 lg:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Bộ sưu tập mới nhất 2026
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Công nghệ đỉnh cao, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  kiến tạo tương lai
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 font-medium">
                Khám phá thế giới phụ kiện công nghệ đa dạng. Cam kết chính hãng 100%, bảo hành 1 đổi 1 trong vòng 30 ngày.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Mua sắm ngay
                  <ArrowRight size={20} strokeWidth={2.5} />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold text-lg px-8 py-4 rounded-full border border-white/10 transition-all duration-300 active:scale-95"
                >
                  Xem danh mục
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 mt-8 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-3xl font-black text-white">{totalProducts}+</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Sản phẩm</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">50K+</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Khách hàng</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-white">4.9★</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Đánh giá</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative w-full max-w-md lg:max-w-lg px-4 sm:px-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[2rem] lg:rounded-[2.5rem] rotate-6 opacity-30 blur-xl lg:blur-2xl"></div>
                <img
                  src={HERO_BANNER_IMAGE}
                  alt="Sản phẩm nổi bật"
                  className="relative z-10 w-full h-auto rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl object-cover border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="flex items-center justify-center gap-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Truck size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Giao hàng toàn quốc</h4>
                <p className="text-sm text-gray-500 font-medium">Freeship đơn từ 500k</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Cam kết chính hãng</h4>
                <p className="text-sm text-gray-500 font-medium">Hoàn tiền 200% nếu fake</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <RefreshCw size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Đổi trả dễ dàng</h4>
                <p className="text-sm text-gray-500 font-medium">Bảo hành 1 đổi 1 trong 30 ngày</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh mục */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Khám phá danh mục
            </h2>
            <p className="mt-4 text-gray-500 font-medium text-lg">
              Tìm kiếm sản phẩm yêu thích của bạn theo từng nhóm
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-[2rem] bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : categoryBlocks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {categoryBlocks.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  className={`flex flex-col items-center justify-center aspect-square p-6 rounded-[2rem] bg-gradient-to-br ${cat.color} transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl`}
                >
                  <span className="text-4xl sm:text-5xl font-black opacity-80 mb-3 drop-shadow-sm">
                    {cat.name.slice(0, 1).toUpperCase()}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-center line-clamp-2">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 font-medium max-w-2xl mx-auto">
              Chưa có danh mục nào được hiển thị.
            </div>
          )}
        </div>
      </section>

      {/* Banner Flash Sale */}
      {!isLoading && flashSaleItems.length > 0 ? (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-1">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              
              <div className="relative bg-white/95 backdrop-blur-3xl rounded-[2.3rem] px-6 py-10 sm:px-10 sm:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <Zap size={28} className="text-red-600 animate-pulse" fill="currentColor" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Giờ Vàng Giá Sốc
                      </h2>
                      <p className="text-red-600 font-bold mt-1">
                        Săn deal cực bốc - Số lượng có hạn!
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/products"
                    className="shrink-0 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-full transition-all active:scale-95"
                  >
                    Xem tất cả deal
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
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
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Sản phẩm nổi bật
              </h2>
              <p className="mt-3 text-gray-500 font-medium text-lg">
                Những mặt hàng công nghệ được yêu thích nhất
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold group"
            >
              Khám phá thêm
              <ArrowRight size={18} strokeWidth={2.5} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-gray-200 bg-white p-16 text-center text-gray-500 font-medium">
              Chưa có sản phẩm nổi bật.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
