import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { SkeletonLoader } from './components/SkeletonLoader';

// 代碼分割：動態導入頁面組件
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Admin = lazy(() => import('./pages/Admin'));
const Membership = lazy(() => import('./pages/Membership'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Coupons = lazy(() => import('./pages/Coupons'));

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30">
          <Navbar />
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
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
