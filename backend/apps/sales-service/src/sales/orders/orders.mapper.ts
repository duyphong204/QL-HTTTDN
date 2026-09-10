export function mapOrderForResponse(order: {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  user?: {
    email: string;
    profile: {
      fullName: string;
    } | null;
  } | null;
  details: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: { name: string; imageUrl: string | null };
  }[];
}) {
  const customerName =
    order.user?.profile?.fullName || order.user?.email || order.fullName;

  return {
    id: order.id,
    fullName: order.fullName,
    customerName,
    phone: order.phone,
    address: order.address,
    totalAmount: order.totalAmount,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    items: order.details.map((d) => ({
      id: d.id,
      productId: d.productId,
      productName: d.product.name,
      quantity: d.quantity,
      price: d.price,
      imageUrl: d.product.imageUrl,
    })),
  };
}
