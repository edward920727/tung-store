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
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="text-sm text-slate-500">加載中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">儀表板</h1>
        <p className="mt-1 text-sm text-slate-500">快速總覽商店表現與關鍵指標。</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-lg">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    總產品數
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.totalProducts}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/products"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                查看所有產品 →
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-emerald-500/10 px-3 py-2 text-lg text-emerald-600">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    總訂單數
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/orders"
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                查看所有訂單 →
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-violet-500/10 px-3 py-2 text-lg text-violet-600">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    總營收
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900">
                    NT${stats.totalRevenue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-amber-500/10 px-3 py-2 text-lg text-amber-600">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    待處理訂單
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.pendingOrders}
                  </dd>
                </dl>
              </div>
            </div>
            {stats.pendingOrders > 0 && (
              <div className="pt-2">
                <Link
                  to="/admin/orders"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  處理訂單 →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-sky-500/10 px-3 py-2 text-lg text-sky-600">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    總會員數
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/users"
                className="text-xs font-medium text-sky-600 hover:text-sky-700"
              >
                查看所有會員 →
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-lg bg-rose-500/10 px-3 py-2 text-lg text-rose-600">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    優惠券數
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-slate-900">
                    {stats.totalCoupons}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/coupons"
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                查看所有優惠券 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 最近訂單 */}
      <div className="rounded-xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-sm font-semibold tracking-wide text-slate-900">最近訂單</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                  訂單ID
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                  創建時間
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 bg-white">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">
                    暫無訂單
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      NT${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'paid'
                            ? 'bg-sky-100 text-sky-800'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {order.created_at &&
                        (order.created_at instanceof Date
                          ? order.created_at.toLocaleString('zh-TW')
                          : order.created_at.toDate().toLocaleString('zh-TW'))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to="/admin/orders"
                        className="text-slate-700 hover:text-slate-950 underline-offset-4 hover:underline"
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
