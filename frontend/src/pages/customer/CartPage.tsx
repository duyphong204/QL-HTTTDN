import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSalesStore } from "@/store/Sales.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import type { CreateOrderDto } from "@/types";
import { toast } from "sonner";

const CartPage = () => {
    const navigate = useNavigate();
    const { cart, actions } = useSalesStore();
    const cartCount = useSalesStore((state) => state.actions.getCartItemCount());
    const [customerInfo, setCustomerInfo] = useState({
        fullName: '',
        phone: '',
        address: '',
        paymentMethod: 'COD'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        actions.loadCart();
    }, [actions]);

 const handleQuantityChange = (productId: string, quantity: number) => {
    const item = cart.find(i => i.productId === productId);

    if (!item) return;

    if (quantity <= 0) {
        actions.removeFromCart(productId);
        return;
    }

    if (quantity > (item.product?.stockQuantity ?? 0)) {
        toast.error("Số lượng vượt quá tồn kho");
        return;
    }

    actions.updateCartItem(productId, { quantity });
};

    

    const totalPrice = actions.getCartTotal();
    const totalItems = actions.getCartItemCount();

    const handleCheckout = async () => {
        if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        try {
            setLoading(true);
            
            const orderData: CreateOrderDto = {
                fullName: customerInfo.fullName,
                phone: customerInfo.phone,
                address: customerInfo.address,
                paymentMethod: customerInfo.paymentMethod,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            await actions.createOrder(orderData);
            
            alert('Đặt hàng thành công!');
            navigate('/orders');
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <ShoppingCart className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
                </div>
                
                {cart.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                            <Button onClick={() => navigate('/products')}>
                                Tiếp tục mua sắm
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sản phẩm trong giỏ ({totalItems} sản phẩm)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="font-bold text-gray-700">Sản phẩm</TableHead>
                                                    <TableHead className="font-bold text-gray-700">Giá</TableHead>
                                                    <TableHead className="font-bold text-gray-700">Số lượng</TableHead>
                                                    <TableHead className="font-bold text-gray-700">Tổng</TableHead>
                                                    <TableHead className="text-right font-bold text-gray-700">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cart.map(item => (
                                                    <TableRow key={item.productId} className="hover:bg-gray-50/50">
                                                        <TableCell className="font-medium">
                                                            {item.product?.name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>{item.product?.price?.toLocaleString()}đ</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                >
                                                                    <Minus size={14} />
                                                                </Button>
                                                                <span className="w-8 text-center">{item.quantity}</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                >
                                                                    <Plus size={14} />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {(item.product?.price || 0) * item.quantity}đ
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => actions.removeFromCart(item.productId)}
                                                                className="h-8 w-8 text-gray-600 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Checkout Form */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Số lượng sản phẩm:</span>
                                        <span className="font-medium">{totalItems}</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-blue-600">{totalPrice.toLocaleString()}đ</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin giao hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ tên *</Label>
                                        <Input 
                                            id="fullName" 
                                            value={customerInfo.fullName}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                                            placeholder="Nhập họ tên"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại *</Label>
                                        <Input 
                                            id="phone"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Địa chỉ *</Label>
                                        <Textarea
                                            id="address"
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="Nhập địa chỉ giao hàng"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                                        <Select 
                                            value={customerInfo.paymentMethod} 
                                            onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, paymentMethod: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="COD">Thanh toán khi nhận hàng</SelectItem>
                                                <SelectItem value="BANK">Chuyển khoản</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Checkout Button */}
                            <Button 
                                className="w-full" 
                                size="lg"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                            </Button>

                            <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => navigate('/products')}
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CartPage;