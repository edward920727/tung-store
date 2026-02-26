import { useState, useEffect } from 'react';
import { firestoreService, Order } from '../services/firestore';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalCoupons: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [products, orders, users, coupons] = await Promise.all([
        firestoreService.getProducts(),
        firestoreService.getAllOrders(),
        firestoreService.getAllUsers(),
        firestoreService.getCoupons(),
      ]);

      const totalRevenue = orders
        .filter((o) => o.status === 'delivered' || o.status === 'paid')
        .reduce((sum, order) => sum + order.total_amount, 0);

      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      // 獲取最近的訂單（最多5筆）
      const sortedOrders = [...orders]
        .sort((a, b) => {
          const aTime = a.created_at?.toMillis?.() || a.created_at?.seconds * 1000 || 0;
          const bTime = b.created_at?.toMillis?.() || b.created_at?.seconds * 1000 || 0;
          return bTime - aTime;
        })
        .slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalCoupons: coupons.length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error('獲取儀表板數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">加載中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">儀表板</h1>
        <p className="mt-2 text-gray-600">歡迎回到管理後台</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">總產品數</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/admin/products"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                查看所有產品 →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">總訂單數</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/admin/orders"
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                查看所有訂單 →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">總營收</dt>
                  <dd className="text-2xl font-semibold text-gray-900">NT${stats.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">待處理訂單</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</dd>
                </dl>
              </div>
            </div>
            {stats.pendingOrders > 0 && (
              <div className="mt-4">
                <Link
                  to="/admin/orders"
                  className="text-sm font-medium text-yellow-600 hover:text-yellow-500"
                >
                  處理訂單 →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">總會員數</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/admin/users"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                查看所有會員 →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">優惠券數</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{stats.totalCoupons}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/admin/coupons"
                className="text-sm font-medium text-pink-600 hover:text-pink-500"
              >
                查看所有優惠券 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 最近訂單 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近訂單</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">創建時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    暫無訂單
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      NT${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'paid'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status === 'pending'
                          ? '待付款'
                          : order.status === 'paid'
                          ? '已付款'
                          : order.status === 'shipped'
                          ? '已出貨'
                          : order.status === 'delivered'
                          ? '已完成'
                          : '已取消'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.created_at &&
                        (order.created_at instanceof Date
                          ? order.created_at.toLocaleString('zh-TW')
                          : order.created_at.toDate().toLocaleString('zh-TW'))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to="/admin/orders"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        查看詳情
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
