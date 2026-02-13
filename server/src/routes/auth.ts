import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../database';
import { User } from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '請提供用戶名、郵箱和密碼' });
    }

    // 檢查用戶是否已存在
    const existingUser = await dbGet('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]) as User | undefined;
    
    if (existingUser) {
      return res.status(400).json({ error: '用戶名或郵箱已存在' });
    }

    // 確保默認會員等級存在（id=1）
    let defaultLevelId = 1;
    try {
      const defaultLevel = await dbGet('SELECT id FROM membership_levels WHERE id = 1') as { id: number } | undefined;
      if (!defaultLevel) {
        // 如果id=1不存在，查找第一個等級
        const firstLevel = await dbGet('SELECT id FROM membership_levels ORDER BY min_points ASC LIMIT 1') as { id: number } | undefined;
        if (firstLevel) {
          defaultLevelId = firstLevel.id;
        } else {
          // 如果沒有任何等級，創建一個
          await dbRun(
            "INSERT INTO membership_levels (name, description, discount_percentage, min_points, color, icon) VALUES (?, ?, ?, ?, ?, ?)",
            ['普通會員', '新註冊會員', 0, 0, '#6B7280', '⭐']
          );
          defaultLevelId = 1;
        }
      }
    } catch (error) {
      console.error('檢查會員等級失敗:', error);
      // 繼續使用默認值1
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 創建用戶（使用確定的會員等級ID）
    const result = await dbRun(
      'INSERT INTO users (username, email, password, membership_level_id, points, total_spent) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, defaultLevelId, 0, 0]
    );

    const userId = (result as any).lastID;

    // 獲取會員等級信息
    let userWithMembership: (User & { membership_name: string; membership_description: string; discount_percentage: number; color: string; icon: string }) | undefined;
    try {
      userWithMembership = await dbGet(
        `SELECT u.*, ml.name as membership_name, ml.description as membership_description, 
                ml.discount_percentage, ml.color, ml.icon 
         FROM users u 
         LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
         WHERE u.id = ?`,
        [userId]
      ) as (User & { membership_name: string; membership_description: string; discount_percentage: number; color: string; icon: string }) | undefined;
    } catch (error) {
      console.error('獲取會員等級信息失敗:', error);
      // 使用默認值
      userWithMembership = undefined;
    }

    // 生成JWT令牌
    const token = jwt.sign({ userId, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '註冊成功',
      token,
      user: {
        id: userId,
        username,
        email,
        role: 'user',
        membership_level_id: defaultLevelId,
        points: 0,
        total_spent: 0,
        membership_name: userWithMembership?.membership_name || '普通會員',
        membership_description: userWithMembership?.membership_description || '',
        discount_percentage: userWithMembership?.discount_percentage || 0,
        color: userWithMembership?.color || '#6B7280',
        icon: userWithMembership?.icon || '⭐'
      }
    });
  } catch (error: any) {
    console.error('註冊錯誤:', error);
    console.error('錯誤詳情:', error.message);
    console.error('錯誤堆疊:', error.stack);
    
    // 提供更詳細的錯誤信息
    let errorMessage = '伺服器錯誤';
    if (error.message) {
      if (error.message.includes('UNIQUE constraint')) {
        errorMessage = '用戶名或郵箱已存在';
      } else if (error.message.includes('FOREIGN KEY')) {
        errorMessage = '會員等級設置錯誤，請聯繫管理員';
      } else if (error.message.includes('NOT NULL')) {
        errorMessage = '請填寫所有必填欄位';
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 登錄
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '請提供郵箱和密碼' });
    }

    // 查找用戶
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]) as User | undefined;

    if (!user) {
      return res.status(401).json({ error: '郵箱或密碼錯誤' });
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: '郵箱或密碼錯誤' });
    }

    // 獲取會員等級信息
    let userWithMembership: (User & { membership_name: string; membership_description: string; discount_percentage: number; color: string; icon: string }) | undefined;
    try {
      userWithMembership = await dbGet(
        `SELECT u.*, ml.name as membership_name, ml.description as membership_description, 
                ml.discount_percentage, ml.color, ml.icon 
         FROM users u 
         LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
         WHERE u.id = ?`,
        [user.id]
      ) as (User & { membership_name: string; membership_description: string; discount_percentage: number; color: string; icon: string }) | undefined;
    } catch (error) {
      console.error('獲取會員等級信息失敗:', error);
      userWithMembership = undefined;
    }

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登錄成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        membership_level_id: user.membership_level_id || 1,
        points: user.points || 0,
        total_spent: user.total_spent || 0,
        membership_name: userWithMembership?.membership_name || '普通會員',
        membership_description: userWithMembership?.membership_description || '',
        discount_percentage: userWithMembership?.discount_percentage || 0,
        color: userWithMembership?.color || '#6B7280',
        icon: userWithMembership?.icon || '⭐'
      }
    });
  } catch (error) {
    console.error('登錄錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
