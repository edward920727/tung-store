import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, CartItem } from '../services/firestore';

const Navbar = () => {
  const { user, logout, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // 獲取分類
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await firestoreService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('獲取分類失敗:', error);
      }
    };
    fetchCategories();
  }, []);

  // 獲取購物車
  useEffect(() => {
    if (firebaseUser) {
      const fetchCart = async () => {
        try {
          const items = await firestoreService.getCartItems(firebaseUser.uid);
          setCartItems(items);
          const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalCount);
        } catch (error) {
          console.error('獲取購物車失敗:', error);
        }
      };
      fetchCart();
      
      // 定期刷新購物車
      const interval = setInterval(fetchCart, 30000);
      return () => clearInterval(interval);
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [firebaseUser]);

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <>
      <nav className="bg-[#faf9f7] border-b border-[#e8e6e3] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        {/* 頂部欄 */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-light text-gray-700">
                  時尚女裝
                </span>
              </Link>

              {/* 搜索框 */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="搜尋商品..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              {/* 右側操作區 */}
              <div className="flex items-center space-x-4">
                {/* 手機端搜索按鈕 */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-pink-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* 購物車 */}
                <div className="relative" ref={cartDropdownRef}>
                  <button
                    onClick={() => setCartOpen(!cartOpen)}
                    className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>

                  {/* 購物車下拉 */}
                  {cartOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-lg">購物車</h3>
                      </div>
                      {cartItems.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p>購物車是空的</p>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-y-auto">
                            {cartItems.map((item) => (
                              <div key={item.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={item.product?.image_url || 'https://via.placeholder.com/60'}
                                    alt={item.product?.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {item.product?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      數量: {item.quantity} × NT${item.product?.price || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold">總計</span>
                              <span className="text-lg font-bold text-pink-600">NT${cartTotal.toFixed(2)}</span>
                            </div>
                            <Link
                              to="/cart"
                              onClick={() => setCartOpen(false)}
                              className="block w-full bg-pink-600 hover:bg-pink-700 text-white text-center py-2 rounded-md font-medium transition-colors"
                            >
                              前往結帳
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 會員登入/用戶信息 */}
                {user ? (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link
                      to="/membership"
                      className="text-sm text-gray-700 hover:text-pink-600"
                    >
                      {user.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-pink-600"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="text-sm text-gray-700 hover:text-pink-600"
                    >
                      會員登入
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full transition-colors"
                    >
                      加入會員
                    </Link>
                  </div>
                )}

                {/* 手機端菜單按鈕 */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-pink-600"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主導航欄 */}
        <div className="hidden md:block border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 h-14">
              <Link
                to="/products"
                className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
              >
                所有商品
              </Link>

              {/* 分類下拉菜單 */}
              <div className="relative" ref={categoryMenuRef}>
                <button
                  onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors flex items-center"
                >
                  分類
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoryMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category}
                          to={`/products?category=${encodeURIComponent(category)}`}
                          onClick={() => setCategoryMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {category}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">暫無分類</div>
                    )}
                  </div>
                )}
              </div>

              <Link
                to="/coupons"
                className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
              >
                優惠活動
              </Link>

              {user && (
                <>
                  <Link
                    to="/favorites"
                    className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
                  >
                    我的收藏
                  </Link>
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors"
                  >
                    我的訂單
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 手機端搜索欄 */}
        {searchOpen && (
          <div className="md:hidden border-b border-gray-200 p-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋商品..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* 手機端下拉菜單 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* 頭部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                時尚女裝
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 菜單內容 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                >
                  首頁
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                >
                  所有商品
                </Link>
                {categories.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">分類</p>
                    {categories.map((category) => (
                      <Link
                        key={category}
                        to={`/products?category=${encodeURIComponent(category)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  to="/coupons"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                >
                  優惠活動
                </Link>
                {user && (
                  <>
                    <Link
                      to="/favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                    >
                      我的收藏
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                    >
                      我的訂單
                    </Link>
                    <Link
                      to="/membership"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                    >
                      我的會員
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 底部 */}
            <div className="border-t border-gray-200 p-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    {user.username}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-md text-sm font-medium"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-md text-center text-sm font-medium"
                  >
                    會員登入
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full border border-pink-600 text-pink-600 hover:bg-pink-50 py-2 rounded-md text-center text-sm font-medium"
                  >
                    加入會員
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
