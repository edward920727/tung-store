import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../services/firestore';
import { OptimizedImage } from './OptimizedImage';

interface FeaturedImageCardProps {
  product: Product;
}

export const FeaturedImageCard = ({ product }: FeaturedImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 獲取圖片：如果有 image_urls 且有多張圖片，懸停時顯示第二張
  const primaryImage = product.image_url || 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=400&q=80';
  const hoverImage = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls[0] 
    : null;
  const currentImage = isHovered && hoverImage ? hoverImage : primaryImage;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden transition-all duration-300"
      aria-label={`查看 ${product.name} 的詳情`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 滿版大圖區域 - 支持懸停切換 */}
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] mb-3">
        <div className="relative w-full h-full">
          {/* 主圖 */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered && hoverImage ? 'opacity-0' : 'opacity-100'
          }`}>
            <OptimizedImage
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ${
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
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          )}
        </div>
        {/* 覆蓋層文字 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end pointer-events-none">
          <div className="p-6 w-full">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-white mb-2">
              {product.name}
            </h3>
            <p className="text-sm sm:text-base text-white/90 font-light">
              NT${product.price}
            </p>
          </div>
        </div>
        {product.stock === 0 && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 text-sm font-light z-10">
            缺貨
          </div>
        )}
      </div>
    </Link>
  );
};
