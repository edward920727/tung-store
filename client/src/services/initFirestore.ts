import { firestoreService, MembershipLevel } from './firestore';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * 初始化 Firestore 數據庫
 * 創建默認的會員等級和示例數據
 */
export const initFirestore = async () => {
  try {
    // 檢查是否已有會員等級
    const existingLevels = await firestoreService.getMembershipLevels();
    
    if (existingLevels.length === 0) {
      // 創建默認會員等級
      const defaultLevels: Omit<MembershipLevel, 'id' | 'created_at'>[] = [
        {
          name: '普通會員',
          description: '新註冊會員',
          discount_percentage: 0,
          min_points: 0,
          color: '#6B7280',
          icon: '⭐',
        },
        {
          name: '銀卡會員',
          description: '消費滿500元',
          discount_percentage: 5,
          min_points: 500,
          color: '#9CA3AF',
          icon: '✨',
        },
        {
          name: '金卡會員',
          description: '消費滿2000元',
          discount_percentage: 10,
          min_points: 2000,
          color: '#FBBF24',
          icon: '👑',
        },
        {
          name: '鑽石會員',
          description: '消費滿5000元',
          discount_percentage: 15,
          min_points: 5000,
          color: '#60A5FA',
          icon: '💎',
        },
      ];

      for (const level of defaultLevels) {
        await addDoc(collection(db, 'membership_levels'), {
          ...level,
          created_at: serverTimestamp(),
        });
      }
      console.log('✅ 默認會員等級已創建');
    }

    // 檢查是否已有商品
    const existingProducts = await firestoreService.getProducts();
    
    if (existingProducts.length === 0) {
      // 創建示例商品
      const sampleProducts = [
        {
          name: 'iPhone 15 Pro',
          description: '最新款iPhone，配備A17 Pro芯片',
          price: 8999,
          stock: 50,
          image_url: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
          category: '電子產品',
        },
        {
          name: 'MacBook Pro 14"',
          description: 'M3芯片，14英寸Liquid Retina XDR顯示屏',
          price: 14999,
          stock: 30,
          image_url: 'https://via.placeholder.com/300x300?text=MacBook+Pro',
          category: '電子產品',
        },
        {
          name: 'AirPods Pro',
          description: '主動降噪無線耳機',
          price: 1899,
          stock: 100,
          image_url: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
          category: '電子產品',
        },
        {
          name: 'Nike運動鞋',
          description: '舒適透氣的運動鞋',
          price: 899,
          stock: 80,
          image_url: 'https://via.placeholder.com/300x300?text=Nike+Shoes',
          category: '服裝鞋帽',
        },
        {
          name: '咖啡機',
          description: '全自動意式咖啡機',
          price: 2999,
          stock: 25,
          image_url: 'https://via.placeholder.com/300x300?text=Coffee+Machine',
          category: '家用電器',
        },
        {
          name: '藍牙音箱',
          description: '360度環繞立體聲音箱',
          price: 599,
          stock: 60,
          image_url: 'https://via.placeholder.com/300x300?text=Bluetooth+Speaker',
          category: '電子產品',
        },
      ];

      for (const product of sampleProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          created_at: serverTimestamp(),
        });
      }
      console.log('✅ 示例商品已創建');
    }

    console.log('✅ Firestore 初始化完成');
  } catch (error) {
    console.error('❌ Firestore 初始化失敗:', error);
    throw error;
  }
};
