import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWarehouseStore } from "@/store/Warehouse.store";
import { useSalesStore } from "@/store/Sales.store";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, Plus, Minus, Star } from "lucide-react";
import type { Product } from "@/types";

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { actions: warehouseActions } = useWarehouseStore();
    const { actions: salesActions } = useSalesStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            const productData = await warehouseActions.getProductById(id);
            setProduct(productData);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);
            salesActions.addToCart({
                productId: product.id,
                quantity: quantity
            });
            alert('Đã thêm vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Card className="max-w-md">
                        <CardContent className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-500 mb-6">Sản phẩm này có thể đã bị xóa hoặc không tồn tại</p>
                            <Button onClick={() => navigate('/products')}>
                                Quay lại danh sách sản phẩm
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                {/* Back Button */}
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/products')}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {/* Placeholder for product image */}
                            <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="h-24 w-24 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-3xl font-bold text-blue-600">
                                    {product.price.toLocaleString()}đ
                                </span>
                                <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                                    {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                                </Badge>
                            </div>
                            
                            {/* Rating placeholder */}
                            <div className="flex items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-sm text-gray-500 ml-2">(4.5/5 - 120 đánh giá)</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-medium mb-2">Mô tả sản phẩm</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                            </p>
                        </div>

                        <Separator />

                        {/* Add to Cart */}
                        {product.stockQuantity > 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Số lượng:</span>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleQuantityChange(quantity - 1)}
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </Button>
                                                <span className="w-12 text-center font-medium">{quantity}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleQuantityChange(quantity + 1)}
                                                    disabled={quantity >= product.stockQuantity}
                                                >
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        <Button 
                                            className="w-full" 
                                            size="lg"
                                            onClick={handleAddToCart}
                                            disabled={addingToCart}
                                        >
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Product Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã sản phẩm:</span>
                                    <span className="font-medium">{product.id.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Danh mục:</span>
                                    <span className="font-medium">{product.category?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tồn kho:</span>
                                    <span className="font-medium">{product.stockQuantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span className="font-medium">
                                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetailPage;