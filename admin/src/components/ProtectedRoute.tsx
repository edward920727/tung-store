import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isHeadquartersVerified } from '../utils/adminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, firebaseUser, loading } = useAuth();
  const [waitingForFirestore, setWaitingForFirestore] = useState(false);
  const [isAdminAllowed, setIsAdminAllowed] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);

  // 如果 Firebase 用户存在但 Firestore 数据还在加载，等待一下
  useEffect(() => {
    if (firebaseUser && !user && !loading) {
      console.log('Firebase 用户已认证，等待 Firestore 数据加载...');
      setWaitingForFirestore(true);
      
      // 给 Firestore 数据加载一些时间（最多等待 3 秒）
      const timeout = setTimeout(() => {
        setWaitingForFirestore(false);
        console.log('等待 Firestore 数据加载超时');
      }, 3000);

      return () => clearTimeout(timeout);
    } else if (user || !firebaseUser) {
      setWaitingForFirestore(false);
    }
  }, [firebaseUser, user, loading]);

  // 根据当前用户信息计算管理员权限（使用 state，避免直接返回空白）
  useEffect(() => {
    // 非管理员路由不需要额外检查
    if (!requireAdmin) {
      setIsAdminAllowed(true);
      setAdminCheckDone(true);
      return;
    }

    // 还在加载 Firebase 或 Firestore，先不标记检查完成
    if (loading || (firebaseUser && !user && waitingForFirestore)) {
      setAdminCheckDone(false);
      return;
    }

    // 没有 Firebase 用户或没有 Firestore 用户数据，检查结束，不允许访问
    if (!firebaseUser || !user) {
      setIsAdminAllowed(false);
      setAdminCheckDone(true);
      return;
    }

    // 严格检查管理员权限：必须是 admin 角色或通过总部验证
    const isAdmin = user.role === 'admin';
    let isHeadquartersAuth = false;

    try {
      isHeadquartersAuth = isHeadquartersVerified();
    } catch (error) {
      console.error('检查总部验证状态时出错:', error);
      isHeadquartersAuth = false;
    }

    const allowed = isAdmin || isHeadquartersAuth;

    console.log('管理员权限检查（使用 isAdminAllowed 狀態）:', {
      email: user.email,
      role: user.role,
      isAdmin,
      isHeadquartersAuth,
      firebaseUserEmail: firebaseUser.email,
      allowed,
    });

    setIsAdminAllowed(allowed);
    setAdminCheckDone(true);
  }, [requireAdmin, loading, firebaseUser, user, waitingForFirestore]);

  // 如果还在全局加载中，或者 Firebase 用户存在但 Firestore 数据还在加载，显示加载状态
  if (loading || (firebaseUser && !user && waitingForFirestore)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  // 如果没有 Firebase 用户，重定向到登录页
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // 如果有 Firebase 用户但没有 Firestore 用户数据，也重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 只有 requireAdmin 的路由才需要额外的管理员权限检查
  if (requireAdmin) {
    // 管理员权限尚未检查完成，显示權限檢查中的提示，避免直接返回 null 導致畫面空白
    if (!adminCheckDone) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">權限檢查中，請稍後...</div>
        </div>
      );
    }

    // 已檢查且不具備管理員權限：不顯示後台內容（可根據需要改為跳轉）
    if (!isAdminAllowed) {
      console.log('管理員權限檢查完成，但不允許訪問，顯示空白頁面');
      return (
        <div className="min-h-screen bg-white">
          {/* 保持與原來邏輯一致：不顯示任何內容 */}
        </div>
      );
    }

    console.log('管理員權限檢查完成，允許訪問後台');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
