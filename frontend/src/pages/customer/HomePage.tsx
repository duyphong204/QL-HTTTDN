import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { useWarehouseStore } from "@/store/Warehouse.store";
import { useSalesStore } from '@/store/Sales.store';

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const products = useWarehouseStore((state) => state.products);
  const loading = useWarehouseStore((state) => state.productsLoading);
  const fetchProducts = useWarehouseStore((state) => state.actions.fetchProducts);
  const addToCart = useSalesStore((state) => state.actions.addToCart);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

    if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-lg">Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-12">
          <h1 className="text-4xl font-bold mb-4">Chào mừng đến với ShopHub</h1>
          <p className="text-xl mb-6">Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất</p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/products')}
          >
            Mua sắm ngay
          </Button>
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Sản phẩm nổi bật</h2>
          
          {loading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có sản phẩm nào
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  {...product}
                  onAddToCart={() =>
                    addToCart({
                    productId: product.id,
                    quantity: 1,
                    product: product
                  })
                }
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={() => navigate('/products')}
          >
            Xem tất cả sản phẩm
          </Button>
        </div>
      </main>
    </div>
  );
}