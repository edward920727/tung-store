import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// 數據模型接口
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  membership_level_id: string;
  points: number;
  total_spent: number;
  created_at: Timestamp;
  // 可選的會員信息（用於顯示）
  icon?: string;
  color?: string;
  membership_name?: string;
}

export interface MembershipLevel {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  min_points: number;
  color: string;
  icon: string;
  created_at: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  created_at: Timestamp;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  created_at: Timestamp;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  valid_from: Timestamp;
  valid_until: Timestamp;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: Timestamp;
}

export interface HomePageConfig {
  id: string;
  // Hero 區域
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  heroButtonText: string;
  heroButtonLink: string;
  
  // 顏色主題
  primaryColor: string; // 主色
  secondaryColor: string; // 輔助色
  gradientFrom: string; // 漸變起始色
  gradientTo: string; // 漸變結束色
  
  // 精選商品
  featuredProductIds: string[]; // 精選商品 ID 列表（已排序）
  
  // 布局選項
  layout: 'default' | 'compact' | 'wide'; // 布局類型
  showFeatures: boolean; // 是否顯示特色區塊
  showGallery: boolean; // 是否顯示畫廊
  
  // 區塊順序
  sectionOrder: string[]; // 區塊順序，例如：['hero', 'features', 'gallery']
  
  // 特色區塊
  features: Array<{
    title: string;
    description: string;
    icon: string;
    imageUrl: string;
    gradientFrom: string;
    gradientTo: string;
  }>;
  
  updated_at: Timestamp;
  created_at: Timestamp;
}

// Firestore 服務類
class FirestoreService {
  // ========== 用戶相關 ==========
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.log('用戶文檔不存在，UID:', userId);
        // 嘗試通過 email 查找
        return null;
      }
      const userData = { id: userDoc.id, ...userDoc.data() } as User;
      console.log('找到用戶文檔:', userData);
      return userData;
    } catch (error) {
      console.error('獲取用戶失敗:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>, userId?: string): Promise<string> {
    // 如果提供了 userId（Firebase UID），使用它作為文檔 ID
    // 否則使用 addDoc 創建隨機 ID
    if (userId) {
      console.log('使用 setDoc 創建用戶，ID:', userId, '數據:', userData);
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        created_at: serverTimestamp(),
      });
      console.log('用戶文檔已創建');
      return userId;
    } else {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        created_at: serverTimestamp(),
      });
      return docRef.id;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), updates);
  }

  async deleteUser(userId: string): Promise<void> {
    // 刪除 Firestore 中的用戶文檔
    await deleteDoc(doc(db, 'users', userId));
    
    // 注意：這只刪除 Firestore 中的用戶文檔
    // Firebase Authentication 中的用戶需要通過 Firebase Admin SDK 或 Firebase Console 手動刪除
  }

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  }

  // ========== 商品相關 ==========
  async getProducts(filters?: { category?: string; search?: string }): Promise<Product[]> {
    let q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // 客戶端搜索過濾（Firestore 不支持全文搜索）
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(
        p => p.name.toLowerCase().includes(searchTerm) ||
             p.description?.toLowerCase().includes(searchTerm)
      );
    }

    return products;
  }

  async getProduct(productId: string): Promise<Product | null> {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) return null;
    return { id: productDoc.id, ...productDoc.data() } as Product;
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', productId), updates);
  }

  async deleteProduct(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
  }

  async getCategories(): Promise<string[]> {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const categories = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const category = doc.data().category;
      if (category) categories.add(category);
    });
    return Array.from(categories);
  }

  // ========== 購物車相關 ==========
  async getCartItems(userId: string): Promise<CartItem[]> {
    const q = query(
      collection(db, 'cart'),
      where('user_id', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const cartItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CartItem[];

    // 獲取商品信息
    for (const item of cartItems) {
      const product = await this.getProduct(item.product_id);
      if (product) {
        item.product = product;
      }
    }

    return cartItems;
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<void> {
    // 檢查是否已存在
    const q = query(
      collection(db, 'cart'),
      where('user_id', '==', userId),
      where('product_id', '==', productId)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      // 更新數量
      const existingDoc = existing.docs[0];
      await updateDoc(doc(db, 'cart', existingDoc.id), {
        quantity: existingDoc.data().quantity + quantity,
      });
    } else {
      // 添加新項目
      await addDoc(collection(db, 'cart'), {
        user_id: userId,
        product_id: productId,
        quantity,
      });
    }
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<void> {
    await updateDoc(doc(db, 'cart', cartItemId), { quantity });
  }

  async removeCartItem(cartItemId: string): Promise<void> {
    await deleteDoc(doc(db, 'cart', cartItemId));
  }

  async clearCart(userId: string): Promise<void> {
    const q = query(collection(db, 'cart'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // ========== 訂單相關 ==========
  async getOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  }

  async getAllOrders(): Promise<Order[]> {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) return null;
    return { id: orderDoc.id, ...orderDoc.data() } as Order;
  }

  async createOrder(userId: string, items: OrderItem[], totalAmount: number): Promise<string> {
    const docRef = await addDoc(collection(db, 'orders'), {
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      items,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), { status });
  }

  // ========== 會員等級相關 ==========
  async getMembershipLevels(): Promise<MembershipLevel[]> {
    const querySnapshot = await getDocs(collection(db, 'membership_levels'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MembershipLevel[];
  }

  async getMembershipLevel(levelId: string | null | undefined): Promise<MembershipLevel | null> {
    if (!levelId) {
      console.warn('getMembershipLevel: levelId 為空', levelId);
      return null;
    }
    try {
      const levelDoc = await getDoc(doc(db, 'membership_levels', levelId));
      if (!levelDoc.exists()) {
        console.warn('getMembershipLevel: 找不到會員等級，ID:', levelId);
        return null;
      }
      return { id: levelDoc.id, ...levelDoc.data() } as MembershipLevel;
    } catch (error) {
      console.error('getMembershipLevel 錯誤:', error, 'levelId:', levelId);
      return null;
    }
  }

  async getUserMembership(userId: string): Promise<{
    user: User;
    membership: MembershipLevel;
  } | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    let membership = null;
    if (user.membership_level_id) {
      membership = await this.getMembershipLevel(user.membership_level_id);
    }
    
    // 如果沒有會員等級，獲取默認等級
    if (!membership) {
      const defaultLevels = await this.getMembershipLevels();
      if (defaultLevels.length > 0) {
        membership = defaultLevels[0];
        // 更新用戶的會員等級 ID
        await this.updateUser(userId, { membership_level_id: defaultLevels[0].id });
      }
    }
    
    if (!membership) return null;
    return { user, membership };
  }

  // ========== 優惠券相關 ==========
  async getCoupons(): Promise<Coupon[]> {
    const querySnapshot = await getDocs(collection(db, 'coupons'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Coupon[];
  }

  async getCoupon(couponId: string): Promise<Coupon | null> {
    const couponDoc = await getDoc(doc(db, 'coupons', couponId));
    if (!couponDoc.exists()) return null;
    return { id: couponDoc.id, ...couponDoc.data() } as Coupon;
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const q = query(collection(db, 'coupons'), where('code', '==', code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Coupon;
  }

  async createCoupon(couponData: Omit<Coupon, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'coupons'), {
      ...couponData,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateCoupon(couponId: string, updates: Partial<Coupon>): Promise<void> {
    await updateDoc(doc(db, 'coupons', couponId), updates);
  }

  async deleteCoupon(couponId: string): Promise<void> {
    await deleteDoc(doc(db, 'coupons', couponId));
  }

  async createMembershipLevel(levelData: Omit<MembershipLevel, 'id' | 'created_at'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'membership_levels'), {
      ...levelData,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  }

  async updateMembershipLevel(levelId: string, updates: Partial<MembershipLevel>): Promise<void> {
    await updateDoc(doc(db, 'membership_levels', levelId), updates);
  }

  async deleteMembershipLevel(levelId: string): Promise<void> {
    await deleteDoc(doc(db, 'membership_levels', levelId));
  }

  async updateUserMembershipLevel(userId: string, membershipLevelId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { membership_level_id: membershipLevelId });
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    // 更新積分
    await updateDoc(doc(db, 'users', userId), { points });
    
    // 根據積分自動更新會員等級
    const levels = await this.getMembershipLevels();
    const sortedLevels = levels.sort((a, b) => b.min_points - a.min_points);
    const appropriateLevel = sortedLevels.find(level => points >= level.min_points) || sortedLevels[sortedLevels.length - 1];
    
    if (appropriateLevel) {
      await updateDoc(doc(db, 'users', userId), { membership_level_id: appropriateLevel.id });
    }
  }
}

export const firestoreService = new FirestoreService();

// ========== Firebase Storage 圖片上傳 ==========
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('圖片上傳失敗:', error);
    throw error;
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('圖片刪除失敗:', error);
    throw error;
  }
};
