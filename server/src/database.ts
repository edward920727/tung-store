import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./ecommerce.db');

// 將回調式方法轉換為Promise
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export interface MembershipLevel {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  min_points: number;
  color: string;
  icon: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  membership_level_id: number;
  points: number;
  total_spent: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  is_active: number;
  created_at: string;
}

export const initDatabase = async () => {
  // 啟用外鍵約束
  await dbRun('PRAGMA foreign_keys = ON');

  // 創建會員等級表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS membership_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_percentage REAL DEFAULT 0,
      min_points INTEGER DEFAULT 0,
      color TEXT DEFAULT '#6B7280',
      icon TEXT DEFAULT '⭐',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 立即插入默認會員等級（如果不存在）- 必須在創建users表之前
  try {
    const levels = await dbAll("SELECT * FROM membership_levels") as MembershipLevel[];
    if (levels.length === 0) {
      const defaultLevels = [
        { name: '普通會員', description: '新註冊會員', discount_percentage: 0, min_points: 0, color: '#6B7280', icon: '⭐' },
        { name: '銀卡會員', description: '消費滿500元', discount_percentage: 5, min_points: 500, color: '#9CA3AF', icon: '✨' },
        { name: '金卡會員', description: '消費滿2000元', discount_percentage: 10, min_points: 2000, color: '#FBBF24', icon: '👑' },
        { name: '鑽石會員', description: '消費滿5000元', discount_percentage: 15, min_points: 5000, color: '#60A5FA', icon: '💎' },
      ];

      for (const level of defaultLevels) {
        try {
          await dbRun(
            "INSERT INTO membership_levels (name, description, discount_percentage, min_points, color, icon) VALUES (?, ?, ?, ?, ?, ?)",
            [level.name, level.description, level.discount_percentage, level.min_points, level.color, level.icon]
          );
        } catch (err: any) {
          // 忽略重複插入錯誤
          if (!err.message.includes('UNIQUE constraint')) {
            console.error('插入默認會員等級失敗:', err);
            throw err; // 如果是其他錯誤，重新拋出
          }
        }
      }
      console.log('✅ 默認會員等級已創建');
    } else {
      // 確保至少有一個id=1的等級
      const level1 = await dbGet("SELECT id FROM membership_levels WHERE id = 1") as { id: number } | undefined;
      if (!level1) {
        console.warn('⚠️ 警告: membership_levels表中沒有id=1的記錄，這可能導致註冊問題');
      }
    }
  } catch (error) {
    console.error('檢查/創建默認會員等級失敗:', error);
    throw error; // 重新拋出錯誤，阻止服務器啟動
  }

  // 檢查users表是否存在，如果存在則添加新列
  try {
    const tableInfo = await dbAll("PRAGMA table_info(users)") as any[];
    if (tableInfo.length > 0) {
      const hasMembershipLevel = tableInfo.some(col => col.name === 'membership_level_id');
      const hasPoints = tableInfo.some(col => col.name === 'points');
      const hasTotalSpent = tableInfo.some(col => col.name === 'total_spent');

      if (!hasMembershipLevel) {
        try {
          await dbRun('ALTER TABLE users ADD COLUMN membership_level_id INTEGER DEFAULT 1');
          console.log('✅ 已添加 membership_level_id 列');
        } catch (err: any) {
          if (!err.message.includes('duplicate column')) {
            console.error('添加 membership_level_id 列失敗:', err);
          }
        }
      }
      if (!hasPoints) {
        try {
          await dbRun('ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0');
          console.log('✅ 已添加 points 列');
        } catch (err: any) {
          if (!err.message.includes('duplicate column')) {
            console.error('添加 points 列失敗:', err);
          }
        }
      }
      if (!hasTotalSpent) {
        try {
          await dbRun('ALTER TABLE users ADD COLUMN total_spent REAL DEFAULT 0');
          console.log('✅ 已添加 total_spent 列');
        } catch (err: any) {
          if (!err.message.includes('duplicate column')) {
            console.error('添加 total_spent 列失敗:', err);
          }
        }
      }

      // 更新現有用戶的membership_level_id為1（如果為NULL）
      try {
        await dbRun('UPDATE users SET membership_level_id = 1 WHERE membership_level_id IS NULL');
        await dbRun('UPDATE users SET points = 0 WHERE points IS NULL');
        await dbRun('UPDATE users SET total_spent = 0 WHERE total_spent IS NULL');
      } catch (err) {
        console.error('更新現有用戶數據失敗:', err);
      }
    }
  } catch (error) {
    // 如果表不存在，將在下面創建
    console.log('users表不存在，將創建新表...');
  }

  // 創建用戶表（如果不存在）
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      membership_level_id INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 創建商品表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      image_url TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 創建購物車表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    )
  `);

  // 創建訂單表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 創建訂單項表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // 創建優惠券表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_purchase REAL,
      max_discount REAL,
      valid_from DATETIME NOT NULL,
      valid_until DATETIME NOT NULL,
      usage_limit INTEGER,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // 檢查是否已有管理員帳戶
  const admin = await dbGet("SELECT * FROM users WHERE role = 'admin'") as User | undefined;
  
  if (!admin) {
    // 創建默認管理員帳戶
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await dbRun(
      "INSERT INTO users (username, email, password, role, membership_level_id) VALUES (?, ?, ?, ?, ?)",
      ['admin', 'admin@example.com', hashedPassword, 'admin', 1]
    );
    console.log('✅ 默認管理員帳戶已創建: admin / admin123');
  }

  // 檢查是否已有商品
  const products = await dbAll("SELECT * FROM products") as Product[];
  
  if (products.length === 0) {
    // 添加示例商品
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro',
        description: '最新款iPhone，配備A17 Pro芯片',
        price: 8999,
        stock: 50,
        image_url: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
        category: '電子產品'
      },
      {
        name: 'MacBook Pro 14"',
        description: 'M3芯片，14英寸Liquid Retina XDR顯示屏',
        price: 14999,
        stock: 30,
        image_url: 'https://via.placeholder.com/300x300?text=MacBook+Pro',
        category: '電子產品'
      },
      {
        name: 'AirPods Pro',
        description: '主動降噪無線耳機',
        price: 1899,
        stock: 100,
        image_url: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
        category: '電子產品'
      },
      {
        name: 'Nike運動鞋',
        description: '舒適透氣的運動鞋',
        price: 899,
        stock: 80,
        image_url: 'https://via.placeholder.com/300x300?text=Nike+Shoes',
        category: '服裝鞋帽'
      },
      {
        name: '咖啡機',
        description: '全自動意式咖啡機',
        price: 2999,
        stock: 25,
        image_url: 'https://via.placeholder.com/300x300?text=Coffee+Machine',
        category: '家用電器'
      },
      {
        name: '藍牙音箱',
        description: '360度環繞立體聲音箱',
        price: 599,
        stock: 60,
        image_url: 'https://via.placeholder.com/300x300?text=Bluetooth+Speaker',
        category: '電子產品'
      }
    ];

    for (const product of sampleProducts) {
      await dbRun(
        `INSERT INTO products (name, description, price, stock, image_url, category) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product.name, product.description, product.price, product.stock, product.image_url, product.category]
      );
    }
    console.log('✅ 示例商品已添加');
  }

  console.log('✅ 資料庫初始化完成');
  console.log('📋 資料庫表結構已就緒');
  
  // 驗證關鍵表是否存在
  try {
    const membershipCount = await dbAll("SELECT COUNT(*) as count FROM membership_levels") as any[];
    const userCount = await dbAll("SELECT COUNT(*) as count FROM users") as any[];
    console.log(`📊 會員等級數量: ${membershipCount[0]?.count || 0}`);
    console.log(`👥 用戶數量: ${userCount[0]?.count || 0}`);
  } catch (error) {
    console.warn('⚠️ 驗證資料庫狀態時出現警告:', error);
  }
};

// 導出資料庫操作方法
export { dbRun, dbGet, dbAll, db };
