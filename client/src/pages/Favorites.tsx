import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, Product } from '../services/firestore';
import { ProductCard } from '../components/ProductCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const Favorites = () => {
  const { firebaseUser } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    if (firebaseUser) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const fetchFavorites = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const products = await firestoreService.getFavoriteProducts(firebaseUser.uid);
      setFavoriteProducts(products);
    } catch (err) {
      console.error('獲取收藏商品失敗:', err);
      error('獲取收藏商品失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!firebaseUser) return;
    try {
      await firestoreService.removeFromFavorites(firebaseUser.uid, productId);
      setFavoriteProducts(favoriteProducts.filter(p => p.id !== productId));
      success('已取消收藏');
    } catch (err) {
      console.error('取消收藏失敗:', err);
      error('取消收藏失敗');
    }
  };

  if (!firebaseUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">請先登錄以查看收藏商品</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">我的收藏</h1>

        {loading ? (
          <SkeletonLoader type="product-list" count={8} />
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-lg text-gray-500 mb-4">還沒有收藏任何商品</p>
            <p className="text-sm text-gray-400">瀏覽商品並點擊愛心圖標來收藏喜歡的商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="取消收藏"
                  aria-label="取消收藏"
                >
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Favorites;
