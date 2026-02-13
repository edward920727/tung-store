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

  useEffect(() => {
    // 監聽 Firebase 認證狀態變化
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // 從 Firestore 獲取用戶信息
        try {
          const userData = await firestoreService.getUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // 如果 Firestore 中沒有用戶文檔，創建一個
            const defaultLevel = await firestoreService.getMembershipLevels();
            const defaultLevelId = defaultLevel.length > 0 ? defaultLevel[0].id : '';
            
            const newUser: Omit<User, 'id' | 'created_at'> = {
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              role: 'user',
              membership_level_id: defaultLevelId,
              points: 0,
              total_spent: 0,
            };
            
            await firestoreService.createUser(newUser);
            const createdUser = await firestoreService.getUser(firebaseUser.uid);
            setUser(createdUser);
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged 會自動處理用戶狀態更新
    } catch (error: any) {
      console.error('登錄失敗:', error);
      throw new Error(error.message || '登錄失敗');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // 創建 Firebase 用戶
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 獲取默認會員等級
      const membershipLevels = await firestoreService.getMembershipLevels();
      const defaultLevelId = membershipLevels.length > 0 ? membershipLevels[0].id : '';

      // 在 Firestore 中創建用戶文檔
      const newUser: Omit<User, 'id' | 'created_at'> = {
        username,
        email,
        role: 'user',
        membership_level_id: defaultLevelId,
        points: 0,
        total_spent: 0,
      };

      await firestoreService.createUser(newUser);
      // onAuthStateChanged 會自動處理用戶狀態更新
    } catch (error: any) {
      console.error('註冊失敗:', error);
      throw new Error(error.message || '註冊失敗');
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
