import express from 'express';
import { dbGet, dbAll } from '../database';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { User } from '../database';

const router = express.Router();

// 獲取當前用戶信息
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    let user: (User & { membership_name?: string; membership_description?: string; discount_percentage?: number; color?: string; icon?: string }) | undefined;
    try {
      user = await dbGet(
        `SELECT u.id, u.username, u.email, u.role, u.membership_level_id, u.points, u.total_spent, u.created_at,
                ml.name as membership_name, ml.description as membership_description, 
                ml.discount_percentage, ml.color, ml.icon 
         FROM users u 
         LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
         WHERE u.id = ?`,
        [req.userId]
      ) as (User & { membership_name?: string; membership_description?: string; discount_percentage?: number; color?: string; icon?: string }) | undefined;
    } catch (error) {
      // 如果JOIN失敗，只查詢用戶基本信息
      console.error('獲取會員等級信息失敗，使用基本信息:', error);
      user = await dbGet(
        'SELECT id, username, email, role, membership_level_id, points, total_spent, created_at FROM users WHERE id = ?',
        [req.userId]
      ) as User | undefined;
    }
    
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    // 確保返回的數據包含所有必要字段
    res.json({
      ...user,
      membership_name: user.membership_name || '普通會員',
      membership_description: user.membership_description || '',
      discount_percentage: user.discount_percentage || 0,
      color: user.color || '#6B7280',
      icon: user.icon || '⭐'
    });
  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取所有用戶（僅管理員）
router.get('/', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    let users: (User & { membership_name?: string; color?: string; icon?: string })[];
    try {
      users = await dbAll(
        `SELECT u.id, u.username, u.email, u.role, u.membership_level_id, u.points, u.total_spent, u.created_at,
                ml.name as membership_name, ml.color, ml.icon 
         FROM users u 
         LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
         ORDER BY u.created_at DESC`
      ) as (User & { membership_name?: string; color?: string; icon?: string })[];
    } catch (error) {
      // 如果JOIN失敗，只查詢用戶基本信息
      console.error('獲取會員等級信息失敗，使用基本信息:', error);
      users = await dbAll(
        'SELECT id, username, email, role, membership_level_id, points, total_spent, created_at FROM users ORDER BY created_at DESC'
      ) as User[];
    }
    
    // 確保所有用戶都有會員信息
    const usersWithMembership = users.map(user => ({
      ...user,
      membership_name: user.membership_name || '普通會員',
      color: user.color || '#6B7280',
      icon: user.icon || '⭐'
    }));
    
    res.json(usersWithMembership);
  } catch (error) {
    console.error('獲取用戶列表錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
