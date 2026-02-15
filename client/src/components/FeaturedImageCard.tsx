import { Link } from 'react-router-dom';
import { Product } from '../services/firestore';
import { OptimizedImage } from './OptimizedImage';

interface FeaturedImageCardProps {
  product: Product;
}

export const FeaturedImageCard = ({ product }: FeaturedImageCardProps) => {
  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=400&q=80';

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden transition-all duration-300"
      aria-label={`查看 ${product.name} 的詳情`}
    >
      {/* 滿版大圖區域 */}
      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] mb-3">
        <OptimizedImage
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* 覆蓋層文字 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
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
