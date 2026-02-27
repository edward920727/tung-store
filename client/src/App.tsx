import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import { processHeadquartersToken, processAuthTokenLogin } from './utils/adminAuth';

// 代碼分割：動態導入頁面組件
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const Membership = lazy(() => import('./pages/Membership'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Coupons = lazy(() => import('./pages/Coupons'));
const About = lazy(() => import('./pages/About'));
const Stores = lazy(() => import('./pages/Stores'));
const Partnership = lazy(() => import('./pages/Partnership'));
const News = lazy(() => import('./pages/News'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));

// 前台布局組件
const FrontendLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// 後台布局組件
const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
};

// 路由內容組件（需要在 Router 內部使用 useLocation）
const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // 处理总部验证 token 和 authToken（仅在访问 /admin 路径时）
  useEffect(() => {
    if (isAdminRoute) {
      // 使用 try-catch 确保不会导致应用崩溃
      const handleToken = async () => {
        try {
          // 1. 如果 URL 上有 authToken，先嘗試用 Firebase Custom Token 自動登入
          await processAuthTokenLogin();

          // 2. 再處理原本的總部驗證邏輯（admin_token / token）
          await processHeadquartersToken();
        } catch (error) {
          console.error('处理总部验证 token 失败:', error);
          // 静默失败，不影响正常访问
        }
      };
      handleToken();
    }
  }, [isAdminRoute, location.search]);

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SkeletonLoader /></div>}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminLayoutWrapper>
                <AdminDashboard />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminLayoutWrapper>
                <AdminProducts />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminLayoutWrapper>
                <AdminOrders />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminLayoutWrapper>
                <Admin />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/admin/membership"
            element={
              <AdminLayoutWrapper>
                <Admin />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayoutWrapper>
                <Admin />
              </AdminLayoutWrapper>
            }
          />
          <Route
            path="/admin/homepage"
            element={
              <AdminLayoutWrapper>
                <Admin />
              </AdminLayoutWrapper>
            }
          />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <FrontendLayout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SkeletonLoader /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership"
            element={
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <Coupons />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/news" element={<News />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </FrontendLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
