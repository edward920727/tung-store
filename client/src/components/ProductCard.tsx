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
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
      aria-label={`查看 ${product.name} 的詳情`}
    >
      <div className="relative overflow-hidden h-64">
        <OptimizedImage
          src={product.image_url || 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=400&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {product.stock > 0 && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
            有貨
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
            缺貨
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            NT${product.price}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            庫存: {product.stock}
          </span>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
