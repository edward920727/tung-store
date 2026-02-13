import { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('獲取訂單失敗:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (id: number) => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      const order = response.data;
      if (order && order.items && !Array.isArray(order.items)) {
        order.items = [];
      }
      setSelectedOrder(order);
    } catch (error) {
      console.error('獲取訂單詳情失敗:', error);
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已發貨',
      delivered: '已送達',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加載中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的訂單</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">還沒有訂單</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => fetchOrderDetail(order.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">訂單 #{order.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">¥{order.total_amount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
              {selectedOrder && selectedOrder.id === order.id && selectedOrder.items && Array.isArray(selectedOrder.items) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold mb-2">訂單詳情:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
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
