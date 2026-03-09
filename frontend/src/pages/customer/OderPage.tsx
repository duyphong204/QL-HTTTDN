import { useEffect } from "react";
import { useSalesStore } from "@/store/Sales.store";
import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

const statusConfig = {
    PENDING: {
        label: 'Chờ xác nhận',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
    },
    APPROVED: {
        label: 'Đã xác nhận',
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle
    },
    SHIPPING: {
        label: 'Đang giao',
        color: 'bg-purple-100 text-purple-800',
        icon: Truck
    },
    COMPLETED: {
        label: 'Hoàn thành',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
    },
    CANCELLED: {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
    }
};

const OrdersPage = () => {
    const { orders, ordersLoading, actions } = useSalesStore();

    useEffect(() => {
        actions.fetchOrders();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    return (
        <div className="min-h-screen flex flex-col">
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <Package className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">Đơn hàng của bạn</h1>
                </div>
                
                {ordersLoading ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Đang tải đơn hàng...</p>
                        </CardContent>
                    </Card>
                ) : orders.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng</h3>
                            <p className="text-gray-500">Bạn chưa đặt đơn hàng nào</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => {
                            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                                <Card key={order.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    Đơn hàng #{order.id.slice(-8).toUpperCase()}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Ngày đặt: {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                                                <StatusIcon size={14} />
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-medium mb-3">Thông tin giao hàng</h4>
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-medium">Người nhận:</span> {order.fullName}</p>
                                                    <p><span className="font-medium">Số điện thoại:</span> {order.phone}</p>
                                                    <p><span className="font-medium">Địa chỉ:</span> {order.address}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-3">Thanh toán</h4>
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-medium">Phương thức:</span> {order.paymentMethod}</p>
                                                    <p><span className="font-medium">Trạng thái:</span> {order.paymentStatus}</p>
                                                    <p className="text-lg font-bold text-blue-600">
                                                        Tổng: {formatCurrency(order.totalAmount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-3">Chi tiết sản phẩm</h4>
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-gray-50">
                                                            <TableHead className="font-bold text-gray-700">Sản phẩm</TableHead>
                                                            <TableHead className="font-bold text-gray-700">Số lượng</TableHead>
                                                            <TableHead className="font-bold text-gray-700">Giá</TableHead>
                                                            <TableHead className="font-bold text-gray-700">Tổng</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {order.details?.map(detail => (
                                                            <TableRow key={detail.id}>
                                                                <TableCell className="font-medium">
                                                                    {detail.product?.name || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>{detail.quantity}</TableCell>
                                                                <TableCell>{formatCurrency(detail.price)}</TableCell>
                                                                <TableCell className="font-medium">
                                                                    {formatCurrency(detail.price * detail.quantity)}
                                                                </TableCell>
                                                            </TableRow>
                                                        )) || (
                                                            <TableRow>
                                                                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                                                                    Không có chi tiết sản phẩm
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrdersPage;