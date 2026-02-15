import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../services/firestore';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo<ProductCardProps>(({ product }) => {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden transition-all duration-300"
      aria-label={`查看 ${product.name} 的詳情`}
    >
      {/* 圖片區域 - 放大佔比 */}
      <div className="relative overflow-hidden aspect-[3/4] mb-3">
        <OptimizedImage
          src={product.image_url || 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=400&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs font-medium z-10">
            缺貨
          </div>
        )}
      </div>
      
      {/* 商品信息區域 - 簡潔設計 */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            NT${product.price}
          </span>
          {product.stock > 0 && (
            <span className="text-xs text-gray-400">
              有貨
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
