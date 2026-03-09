import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Eye, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '@/types';

interface ProductCardProps extends Product {
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
  stockQuantity,
  onAddToCart
}: ProductCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg relative">

        {/* IMAGE */}
        {!imgError && image ? (
          <img
            src={`/images/${image}`}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <ImageIcon size={48} className="text-gray-400" />
          </div>
        )}

        {/* Overlay buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/products/${id}`)}
              className="bg-white hover:bg-gray-50"
            >
              <Eye size={16} className="mr-1" />
              Xem
            </Button>
          </div>
        </div>

      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {name}
        </CardTitle>

        <CardDescription className="line-clamp-2">
          {description || 'Không có mô tả'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {price.toLocaleString()}đ
          </span>

          <span
            className={`text-sm px-2 py-1 rounded-full ${
              stockQuantity > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {stockQuantity > 0 ? `Còn ${stockQuantity}` : 'Hết hàng'}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onAddToCart}
            disabled={stockQuantity === 0}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="mr-2" size={16} />
            Thêm vào giỏ
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/products/${id}`)}
          >
            <Eye size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}