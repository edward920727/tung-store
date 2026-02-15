import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../services/firestore';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo<ProductCardProps>(({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 獲取圖片：如果有 image_urls，懸停時顯示第一張懸停圖
  const primaryImage = product.image_url || 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=400&q=80';
  const hoverImage = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls[0]  // 第一張懸停圖
    : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden transition-all duration-300"
      aria-label={`查看 ${product.name} 的詳情`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 圖片區域 - 放大佔比，支持懸停切換 */}
      <div className="relative overflow-hidden aspect-[3/4] mb-3">
        <div className="relative w-full h-full">
          {/* 主圖 */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered && hoverImage ? 'opacity-0' : 'opacity-100'
          }`}>
            <OptimizedImage
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>
          {/* 懸停圖（如果存在） */}
          {hoverImage && (
            <div className={`absolute inset-0 transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <OptimizedImage
                src={hoverImage}
                alt={`${product.name} - 細節圖`}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs font-light z-10">
            缺貨
          </div>
        )}
      </div>
      
      {/* 商品信息區域 - 簡潔設計 */}
      <div className="space-y-1">
        <h3 className="text-sm font-light text-gray-700 line-clamp-2 group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-light">
            NT${product.price}
          </span>
          {product.stock > 0 && (
            <span className="text-xs text-gray-400 font-light">
              有貨
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
