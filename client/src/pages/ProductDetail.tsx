import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, Product } from '../services/firestore';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const prod = await firestoreService.getProduct(id);
      setProduct(prod);
    } catch (error) {
      console.error('獲取商品失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!firebaseUser) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setAdding(true);
    try {
      await firestoreService.addToCart(firebaseUser.uid, product.id, quantity);
      alert('商品已添加到購物車！');
    } catch (error: any) {
      alert(error.message || '添加失敗');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加載中...</div>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image_url || 'https://via.placeholder.com/600x600'}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600 mb-4">¥{product.price}</p>
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
              />
            </div>
          ) : (
            <div className="mb-6 text-red-600 font-medium">缺貨</div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {adding ? '添加中...' : product.stock > 0 ? '加入購物車' : '缺貨'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
