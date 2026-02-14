import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, Product } from '../services/firestore';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { SkeletonLoader } from '../components/SkeletonLoader';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (firebaseUser && product) {
      checkFavorite();
    }
  }, [firebaseUser, product]);

  const fetchProduct = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const prod = await firestoreService.getProduct(id);
      if (!prod) {
        console.warn('商品不存在:', id);
      }
      setProduct(prod);
    } catch (error) {
      console.error('獲取商品失敗:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!firebaseUser || !product) return;
    try {
      const favorite = await firestoreService.isFavorite(firebaseUser.uid, product.id);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('檢查收藏狀態失敗:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!firebaseUser) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await firestoreService.removeFromFavorites(firebaseUser.uid, product.id);
        setIsFavorite(false);
        success('已取消收藏');
      } else {
        await firestoreService.addToFavorites(firebaseUser.uid, product.id);
        setIsFavorite(true);
        success('已添加到收藏');
      }
    } catch (err: any) {
      console.error('收藏操作失敗:', err);
      showError('操作失敗，請稍後再試');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!firebaseUser) {
      navigate('/login');
      return;
    }

    if (!product) {
      alert('商品信息不完整，請刷新頁面重試');
      return;
    }

    // 檢查庫存
    if (product.stock < quantity) {
      alert(`庫存不足，目前僅剩 ${product.stock} 件`);
      setQuantity(product.stock);
      return;
    }

    if (quantity < 1) {
      alert('請選擇至少 1 件商品');
      return;
    }

    setAdding(true);
    try {
      await firestoreService.addToCart(firebaseUser.uid, product.id, quantity);
      success('商品已添加到購物車！');
    } catch (err: any) {
      console.error('添加到購物車失敗:', err);
      showError(err.message || '添加失敗，請稍後再試');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonLoader type="image" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">商品不存在</div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image_url || 'https://via.placeholder.com/600x600'}
              alt={product.name}
              loading="lazy"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{product.name}</h1>
              {firebaseUser && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`ml-4 p-2 rounded-full transition-colors ${
                    isFavorite
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isFavorite ? '取消收藏' : '加入收藏'}
                  aria-label={isFavorite ? '取消收藏' : '加入收藏'}
                >
                  <svg
                    className="w-6 h-6"
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
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
              )}
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-4">NT${product.price}</p>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="mb-4">
              <span className="text-sm text-gray-500">分類: </span>
              <span className="text-sm font-medium">{product.category}</span>
            </div>
            <div className="mb-4">
              <span className="text-sm text-gray-500">庫存: </span>
              <span className="text-sm font-medium">{product.stock}</span>
            </div>
            {product.stock > 0 ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  數量:
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-label="商品數量"
                />
              </div>
            ) : (
              <div className="mb-6 text-red-600 font-medium">缺貨</div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              aria-label="加入購物車"
            >
              {adding ? '添加中...' : product.stock > 0 ? '加入購物車' : '缺貨'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
