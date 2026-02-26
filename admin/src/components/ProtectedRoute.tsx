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

  // 如果还在加载中，或者 Firebase 用户存在但 Firestore 数据还在加载，显示加载状态
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

  // 严格检查管理员权限：必须是 admin 角色或通过总部验证
  if (requireAdmin) {
    // 严格检查：只有 users 集合中的 role === 'admin' 才能访问
    const isAdmin = user.role === 'admin';
    let isHeadquartersAuth = false;
    
    try {
      isHeadquartersAuth = isHeadquartersVerified();
    } catch (error) {
      console.error('检查总部验证状态时出错:', error);
      // 如果检查失败，默认不允许访问
      isHeadquartersAuth = false;
    }
    
    console.log('管理员权限检查:', {
      email: user.email,
      role: user.role,
      isAdmin,
      isHeadquartersAuth,
      firebaseUserEmail: firebaseUser.email
    });
    
    // 如果既不是管理员（role !== 'admin'），也没有通过总部验证，显示空白页面
    if (!isAdmin && !isHeadquartersAuth) {
      console.log('用户不是管理员且未通过总部验证，显示空白页面');
      return (
        <div className="min-h-screen bg-white">
          {/* 空白页面，不显示任何内容 */}
        </div>
      );
    }
    
    console.log('管理员权限验证通过，允许访问后台');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
