import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, Order } from '../services/firestore';

const Orders = () => {
  const { user, firebaseUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (firebaseUser) {
      fetchOrders();
      // 每30秒自動刷新訂單狀態
      const interval = setInterval(() => {
        fetchOrders();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const fetchOrders = async () => {
    if (!firebaseUser) return;
    try {
      const userOrders = await firestoreService.getOrders(firebaseUser.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('獲取訂單失敗:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const order = await firestoreService.getOrder(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error('獲取訂單詳情失敗:', error);
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '待付款',
      paid: '已付款',
      shipped: '已出貨',
      delivered: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'paid':
        return '💳';
      case 'shipped':
        return '📦';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString('zh-CN');
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('zh-CN');
    }
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加載中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">請先登錄</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的訂單</h1>
        <p className="text-gray-600">查看您的訂單狀態和詳情</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">還沒有訂單</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
              onClick={() => {
                if (selectedOrder && selectedOrder.id === order.id) {
                  setSelectedOrder(null);
                } else {
                  fetchOrderDetail(order.id);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">訂單 #{order.id.slice(0, 8)}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    下單時間：{formatDate(order.created_at)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    訂單金額：<span className="font-semibold text-blue-600">NT${order.total_amount.toFixed(2)}</span>
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-blue-600 mb-2">NT${order.total_amount.toFixed(2)}</p>
                  <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                    <span className="text-lg">{getStatusIcon(order.status)}</span>
                    <span>{getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>
              {selectedOrder && selectedOrder.id === order.id && selectedOrder.items && Array.isArray(selectedOrder.items) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">訂單詳情</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.name || '商品'}</span>
                          <span className="text-gray-500 ml-2">x {item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">NT${(item.price * item.quantity).toFixed(2)}</span>
                          <p className="text-xs text-gray-500 mt-0.5">單價：NT${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {/* 顯示優惠券信息 */}
                    {selectedOrder.original_amount && selectedOrder.original_amount > selectedOrder.total_amount && (
                      <>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-gray-600">原始金額</span>
                          <span className="text-gray-600">NT${selectedOrder.original_amount.toFixed(2)}</span>
                        </div>
                        {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-green-600">
                              優惠券折扣
                              {selectedOrder.coupon_code && (
                                <span className="ml-2 text-xs">({selectedOrder.coupon_code})</span>
                              )}
                            </span>
                            <span className="text-green-600 font-semibold">-NT${selectedOrder.discount_amount.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-bold text-lg text-gray-900">總計</span>
                      <span className="font-bold text-xl text-blue-600">NT${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
