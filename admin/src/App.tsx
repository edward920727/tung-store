import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import AdminLayout from './components/AdminLayout';
import { processHeadquartersToken } from './utils/adminAuth';

// 代码分割：动态导入页面组件
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));

// 后台布局组件
const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
};

// 路由内容组件（需要在 Router 内部使用 useLocation）
const AppRoutes = () => {
  const location = useLocation();

  // 处理总部验证 token
  useEffect(() => {
    const handleToken = async () => {
      try {
        await processHeadquartersToken();
      } catch (error) {
        console.error('处理总部验证 token 失败:', error);
      }
    };
    handleToken();
  }, [location.search]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><SkeletonLoader /></div>}>
      <Routes>
        <Route
          path="/"
          element={
            <AdminLayoutWrapper>
              <AdminDashboard />
            </AdminLayoutWrapper>
          }
        />
        <Route
          path="/products"
          element={
            <AdminLayoutWrapper>
              <AdminProducts />
            </AdminLayoutWrapper>
          }
        />
        <Route
          path="/orders"
          element={
            <AdminLayoutWrapper>
              <AdminOrders />
            </AdminLayoutWrapper>
          }
        />
        <Route
          path="/coupons"
          element={
            <AdminLayoutWrapper>
              <Admin />
            </AdminLayoutWrapper>
          }
        />
        <Route
          path="/membership"
          element={
            <AdminLayoutWrapper>
              <Admin />
            </AdminLayoutWrapper>
          }
        />
        <Route
          path="/users"
          element={
            <AdminLayoutWrapper>
              <Admin />
            </AdminLayoutWrapper>
          }
        />
        <Route
          path="/homepage"
          element={
            <AdminLayoutWrapper>
              <Admin />
            </AdminLayoutWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
