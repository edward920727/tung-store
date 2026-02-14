import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, CartItem, OrderItem } from '../services/firestore';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { SkeletonLoader } from '../components/SkeletonLoader';

const Cart = () => {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    if (firebaseUser) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const fetchCart = async () => {
    if (!firebaseUser) return;
    try {
      const items = await firestoreService.getCartItems(firebaseUser.uid);
      setCartItems(items);
    } catch (error) {
      console.error('獲取購物車失敗:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      alert('數量不能少於 1');
      return;
    }
    
    const cartItem = cartItems.find(item => item.id === cartItemId);
    if (cartItem?.product && quantity > cartItem.product.stock) {
      alert(`庫存不足，目前僅剩 ${cartItem.product.stock} 件`);
      return;
    }
    
    try {
      await firestoreService.updateCartItem(cartItemId, quantity);
      fetchCart();
    } catch (error: any) {
      console.error('更新購物車失敗:', error);
      error(error.message || '更新失敗，請稍後再試');
    }
  };

  const removeItem = async (cartItemId: string) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    if (!confirm(`確定要移除「${item.product?.name || '商品'}」嗎？`)) {
      return;
    }

    try {
      await firestoreService.removeCartItem(cartItemId);
      fetchCart();
    } catch (error) {
      console.error('刪除失敗:', error);
      error('刪除失敗，請稍後再試');
    }
  };

  const checkout = async () => {
    if (!firebaseUser) {
      alert('請先登錄');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('購物車是空的');
      return;
    }

    // 檢查庫存
    const outOfStockItems = cartItems.filter(item => {
      if (!item.product) return true;
      return item.quantity > item.product.stock;
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems
        .map(item => item.product?.name || '商品')
        .join('、');
      alert(`以下商品庫存不足：${itemNames}，請調整數量後再試`);
      fetchCart(); // 刷新購物車以獲取最新庫存
      return;
    }

    setCheckingOut(true);
    try {
      // 計算總金額
      const totalAmount = cartItems.reduce((sum, item) => {
        if (item.product) {
          return sum + item.product.price * item.quantity;
        }
        return sum;
      }, 0);

      if (totalAmount <= 0) {
        alert('訂單金額無效');
        setCheckingOut(false);
        return;
      }

      // 創建訂單項
      const orderItems: OrderItem[] = cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        name: item.product?.name,
        image_url: item.product?.image_url,
      }));

      // 創建訂單
      await firestoreService.createOrder(firebaseUser.uid, orderItems, totalAmount);

      // 清空購物車
      await firestoreService.clearCart(firebaseUser.uid);

      success('訂單創建成功！');
      setTimeout(() => {
        navigate('/orders');
      }, 1000);
    } catch (error: any) {
      console.error('下單失敗:', error);
      error(error.message || '下單失敗，請稍後再試');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = cartItems.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">請先登錄</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            登錄
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">購物車</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 mb-4">購物車是空的</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            去購物
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    <img
                      src={item.product?.image_url || 'https://via.placeholder.com/100x100'}
                      alt={item.product?.name || '商品'}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.product?.name || '商品'}</h3>
                      <p className="text-blue-600 font-bold">NT${item.product?.price || 0}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-lg font-semibold w-24 text-right">
                        NT${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 ml-4"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">訂單摘要</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">小計</span>
                  <span className="font-semibold">NT${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">運費</span>
                  <span className="font-semibold">免費</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">總計</span>
                    <span className="text-lg font-bold text-blue-600">NT${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={checkout}
                disabled={checkingOut}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {checkingOut ? '處理中...' : '結算'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Cart;
