import { useState, useEffect } from 'react';
import { firestoreService, Order } from '../services/firestore';
import { Timestamp } from 'firebase/firestore';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await firestoreService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('獲取訂單失敗:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await firestoreService.updateOrderStatus(orderId, status as Order['status']);
      alert('訂單狀態已更新！');
      fetchOrders(); // 重新獲取訂單列表
    } catch (error) {
      console.error('更新訂單狀態失敗:', error);
      alert('更新訂單狀態失敗，請重試');
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">訂單管理</h1>
        <p className="text-gray-600">管理所有訂單狀態和詳情</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">訂單列表</h2>
        {loading ? (
          <div className="text-center py-12">加載中...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用戶ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">創建時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      NT${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.created_at && (order.created_at instanceof Timestamp 
                        ? order.created_at.toDate().toLocaleString('zh-TW')
                        : new Date(order.created_at).toLocaleString('zh-TW'))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            if (confirm(`確定要將訂單 #${order.id.slice(0, 8)} 的狀態更改為「${getStatusText(e.target.value)}」嗎？`)) {
                              handleUpdateOrderStatus(order.id, e.target.value);
                            } else {
                              // 如果取消，恢復原值
                              e.target.value = order.status;
                            }
                          }}
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                        >
                          <option value="pending">待付款</option>
                          <option value="paid">已付款</option>
                          <option value="shipped">已出貨</option>
                          <option value="delivered">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                        {order.items && order.items.length > 0 && (
                          <button
                            onClick={() => {
                              const itemsList = order.items.map((item) => 
                                `  ${item.name || '商品'} x ${item.quantity} = NT$${(item.price * item.quantity).toFixed(2)}`
                              ).join('\n');
                              alert(`訂單詳情：\n\n${itemsList}\n\n總計：NT$${order.total_amount.toFixed(2)}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                            title="查看訂單詳情"
                          >
                            詳情
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
