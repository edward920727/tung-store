import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, refreshUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 監聽用戶狀態變化
  useEffect(() => {
    if (user) {
      const adminStatus = user.role === 'admin';
      setIsAdmin(adminStatus);
      console.log('Navbar - 用戶狀態更新:', {
        user,
        role: user.role,
        isAdmin: adminStatus,
        timestamp: new Date().toISOString()
      });
    } else {
      setIsAdmin(false);
      console.log('Navbar - 用戶為 null');
    }
  }, [user]);

  // 調試：檢查用戶角色（每次渲染時）
  console.log('Navbar 渲染 - 當前用戶:', user);
  console.log('Navbar 渲染 - 用戶角色:', user?.role);
  console.log('Navbar 渲染 - 是否為管理員:', isAdmin);
  console.log('Navbar 渲染 - Loading:', loading);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    await refreshUser();
    alert('用戶數據已刷新，請檢查是否顯示管理後台按鈕');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 transition-all">
              小童服飾
            </Link>
            {/* 桌面端導航 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                首頁
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                商品
              </Link>
              {user && (
                <>
                  <Link
                    to="/cart"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    購物車
                  </Link>
                  <Link
                    to="/orders"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    我的訂單
                  </Link>
                  <Link
                    to="/membership"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    我的會員
                  </Link>
                  <Link
                    to="/favorites"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    我的收藏
                  </Link>
                  {(isAdmin || user.role === 'admin') && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      管理後台
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* 桌面端用戶信息 */}
          <div className="hidden sm:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  {user.icon && (
                    <span className="text-lg" style={{ color: user.color || '#6B7280' }}>
                      {user.icon}
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">歡迎, {user.username}</span>
                    {user.membership_name && (
                      <span className="text-xs" style={{ color: user.color || '#6B7280' }}>
                        {user.membership_name}
                      </span>
                    )}
                    {user.role && (
                      <span className="text-xs text-gray-500">
                        角色: {user.role === 'admin' ? '管理員' : '普通用戶'}
                      </span>
                    )}
                  </div>
                </div>
                {!isAdmin && user.role !== 'admin' && (
                  <button
                    onClick={handleRefresh}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    title="如果已將角色改為管理員，點擊此按鈕刷新數據"
                  >
                    刷新
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  登錄
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  註冊
                </Link>
              </div>
            )}
          </div>

          {/* 手機端：漢堡菜單按鈕 */}
          <div className="sm:hidden flex items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                {user.icon && (
                  <span className="text-lg" style={{ color: user.color || '#6B7280' }}>
                    {user.icon}
                  </span>
                )}
                <span className="text-sm text-gray-700">{user.username}</span>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">打開主菜單</span>
                  {!mobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-2 py-2 rounded-md text-sm font-medium"
                >
                  登錄
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
                >
                  <span className="sr-only">打開主菜單</span>
                  {!mobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 手機端下拉菜單 */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              首頁
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              商品
            </Link>
            {user && (
              <>
                <Link
                  to="/cart"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  購物車
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  我的訂單
                </Link>
                <Link
                  to="/membership"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  我的會員
                </Link>
                <Link
                  to="/favorites"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  我的收藏
                </Link>
                {(isAdmin || user.role === 'admin') && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-base font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50 font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔧 管理後台
                  </Link>
                )}
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {user.icon && (
                        <span className="text-lg" style={{ color: user.color || '#6B7280' }}>
                          {user.icon}
                        </span>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{user.username}</span>
                        {user.membership_name && (
                          <span className="text-xs" style={{ color: user.color || '#6B7280' }}>
                            {user.membership_name}
                          </span>
                        )}
                        {user.role && (
                          <span className="text-xs text-gray-500">
                            {user.role === 'admin' ? '管理員' : '普通用戶'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isAdmin && user.role !== 'admin' && (
                    <button
                      onClick={async () => {
                        await handleRefresh();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      刷新數據
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    退出登錄
                  </button>
                </div>
              </>
            )}
            {!user && (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登錄
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-md mx-3 mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  註冊
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
