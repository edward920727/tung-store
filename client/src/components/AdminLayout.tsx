import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Receipt,
  Users,
  TicketPercent,
  Sparkles,
  Home as HomeIcon,
  Search as SearchIcon,
  ChevronRight,
  LogOut as LogOutIcon,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout, firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', label: '儀表板', icon: <LayoutDashboard className="h-4 w-4" /> },
    { path: '/admin/products', label: '產品管理', icon: <ShoppingBag className="h-4 w-4" /> },
    { path: '/admin/orders', label: '訂單管理', icon: <Receipt className="h-4 w-4" /> },
    { path: '/admin/coupons', label: '優惠券管理', icon: <TicketPercent className="h-4 w-4" /> },
    { path: '/admin/membership', label: '會員等級', icon: <Sparkles className="h-4 w-4" /> },
    { path: '/admin/users', label: '會員管理', icon: <Users className="h-4 w-4" /> },
    { path: '/admin/homepage', label: '首頁設計', icon: <Package className="h-4 w-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const pathNameMap: Record<string, string> = {
    '/admin': '儀表板',
    '/admin/products': '產品管理',
    '/admin/orders': '訂單管理',
    '/admin/coupons': '優惠券管理',
    '/admin/membership': '會員等級',
    '/admin/users': '會員管理',
    '/admin/homepage': '首頁設計',
  };

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.reduce<{ label: string; href: string }[]>((acc, segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const label = pathNameMap[href] || segment;
    acc.push({ label, href });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* 頂部導覽列：品牌 + 麵包屑 + 搜尋 */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-500 hover:bg-slate-50 lg:hidden"
            >
              <span className="sr-only">切換側邊欄</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <HomeIcon className="h-3.5 w-3.5" />
                <span className="truncate">後台總覽</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                    <span
                      className={
                        index === breadcrumbs.length - 1
                          ? 'font-semibold text-slate-900'
                          : 'hover:text-slate-700 cursor-default'
                      }
                    >
                      {crumb.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 搜尋框 */}
            <div className="hidden md:block">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="搜尋訂單、會員或設定..."
                  className="h-9 w-56 rounded-full border border-slate-200/60 bg-slate-50/60 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                />
              </div>
            </div>

            {/* 使用者區塊 */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <HomeIcon className="h-3.5 w-3.5" />
                返回前台
              </Link>
              <div className="hidden sm:flex flex-col items-end">
                <span className="max-w-[180px] truncate text-xs font-medium text-slate-800">
                  {user?.email || firebaseUser?.email}
                </span>
                <span className="text-[11px] text-slate-400">管理員</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-14">
        {/* 側邊欄 */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-900/40 bg-[#020617] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-slate-800/60">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-900 text-xs font-semibold">
                TS
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-wide text-slate-50">
                  Tung Store Admin
                </span>
                <span className="text-[11px] text-slate-500">控制台</span>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium tracking-wide transition-all ${
                    isActive(item.path)
                      ? 'bg-slate-100 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.35)] translate-x-[2px]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:translate-x-[2px]'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] transition-colors ${
                      isActive(item.path)
                        ? 'border-slate-900 bg-slate-900 text-slate-100'
                        : 'border-slate-700/70 bg-slate-900/30 text-slate-300 group-hover:border-slate-500 group-hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* 側邊欄遮罩（移動設備） */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主內容區 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-8">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
