import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { firestoreService, User } from '../services/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);

  useEffect(() => {
    // 監聽 Firebase 認證狀態變化
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // 從 Firestore 獲取用戶信息
        try {
          const userData = await firestoreService.getUser(firebaseUser.uid);
          if (userData) {
            // 獲取會員等級信息並添加到用戶對象
            const membership = await firestoreService.getMembershipLevel(userData.membership_level_id);
            const userWithMembership: User = {
              ...userData,
              icon: membership?.icon,
              color: membership?.color,
              membership_name: membership?.name,
            };
            setUser(userWithMembership);
            setPendingUsername(null); // 清除待處理的用戶名
          } else {
            // 如果 Firestore 中沒有用戶文檔，創建一個
            const defaultLevel = await firestoreService.getMembershipLevels();
            const defaultLevelId = defaultLevel.length > 0 ? defaultLevel[0].id : '';
            
            const newUser: Omit<User, 'id' | 'created_at'> = {
              username: pendingUsername || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              role: 'user',
              membership_level_id: defaultLevelId,
              points: 0,
              total_spent: 0,
            };
            
            await firestoreService.createUser(newUser);
            const createdUser = await firestoreService.getUser(firebaseUser.uid);
            if (createdUser) {
              const membership = await firestoreService.getMembershipLevel(createdUser.membership_level_id);
              const userWithMembership: User = {
                ...createdUser,
                icon: membership?.icon,
                color: membership?.color,
                membership_name: membership?.name,
              };
              setUser(userWithMembership);
            }
            setPendingUsername(null); // 清除待處理的用戶名
          }
        } catch (error) {
          console.error('獲取用戶信息失敗:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pendingUsername]);

  const login = async (email: string, password: string) => {
    try {
      console.log('嘗試登入:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase 認證成功:', userCredential.user.uid);
      // onAuthStateChanged 會自動處理用戶狀態更新
    } catch (error: any) {
      console.error('登錄失敗詳細信息:', {
        code: error.code,
        message: error.message,
        email: email,
        error: error
      });
      
      // 提供更友好的錯誤訊息
      let errorMessage = '登錄失敗';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = '用戶不存在，請先註冊';
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = '密碼錯誤';
            break;
          case 'auth/invalid-email':
            errorMessage = '郵箱格式不正確';
            break;
          case 'auth/too-many-requests':
            errorMessage = '嘗試次數過多，請稍後再試';
            break;
          case 'auth/network-request-failed':
            errorMessage = '網絡連接失敗，請檢查網絡';
            break;
          case 'auth/unauthorized-domain':
            errorMessage = '域名未授權，請聯繫管理員';
            break;
          default:
            errorMessage = error.message || '登錄失敗';
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('嘗試註冊:', { username, email });
      // 保存用戶名，以便在創建用戶文檔時使用
      setPendingUsername(username);
      // 創建 Firebase 用戶
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase 註冊成功:', userCredential.user.uid);
      // onAuthStateChanged 會自動處理用戶狀態更新
    } catch (error: any) {
      setPendingUsername(null);
      console.error('註冊失敗詳細信息:', {
        code: error.code,
        message: error.message,
        email: email,
        error: error
      });
      
      // 提供更友好的錯誤訊息
      let errorMessage = '註冊失敗';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = '該郵箱已被註冊';
            break;
          case 'auth/invalid-email':
            errorMessage = '郵箱格式不正確';
            break;
          case 'auth/weak-password':
            errorMessage = '密碼強度不足，請使用至少6個字符';
            break;
          case 'auth/network-request-failed':
            errorMessage = '網絡連接失敗，請檢查網絡';
            break;
          case 'auth/unauthorized-domain':
            errorMessage = '域名未授權，請聯繫管理員';
            break;
          default:
            errorMessage = error.message || '註冊失敗';
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
