import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { MembershipLevel, User } from '../database';

const router = express.Router();

// 獲取所有會員等級
router.get('/levels', async (req, res) => {
  try {
    const levels = await dbAll('SELECT * FROM membership_levels ORDER BY min_points ASC') as MembershipLevel[];
    res.json(levels);
  } catch (error) {
    console.error('獲取會員等級錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取單個會員等級
router.get('/levels/:id', async (req, res) => {
  try {
    const level = await dbGet('SELECT * FROM membership_levels WHERE id = ?', [req.params.id]) as MembershipLevel | undefined;
    
    if (!level) {
      return res.status(404).json({ error: '會員等級不存在' });
    }

    res.json(level);
  } catch (error) {
    console.error('獲取會員等級錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 創建會員等級（僅管理員）
router.post('/levels', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, discount_percentage, min_points, color, icon } = req.body;

    if (!name || discount_percentage === undefined || min_points === undefined) {
      return res.status(400).json({ error: '請提供完整的會員等級信息' });
    }

    // 檢查名稱是否已存在
    const existing = await dbGet('SELECT * FROM membership_levels WHERE name = ?', [name]) as MembershipLevel | undefined;
    if (existing) {
      return res.status(400).json({ error: '會員等級名稱已存在' });
    }

    const result = await dbRun(
      `INSERT INTO membership_levels (name, description, discount_percentage, min_points, color, icon) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        discount_percentage,
        min_points,
        color || '#6B7280',
        icon || '⭐'
      ]
    );

    const levelId = (result as any).lastID;
    const level = await dbGet('SELECT * FROM membership_levels WHERE id = ?', [levelId]) as MembershipLevel;
    res.status(201).json(level);
  } catch (error) {
    console.error('創建會員等級錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新會員等級（僅管理員）
router.put('/levels/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, discount_percentage, min_points, color, icon } = req.body;

    await dbRun(
      `UPDATE membership_levels SET 
       name = ?, description = ?, discount_percentage = ?, min_points = ?, color = ?, icon = ? 
       WHERE id = ?`,
      [
        name,
        description,
        discount_percentage,
        min_points,
        color,
        icon,
        req.params.id
      ]
    );

    const level = await dbGet('SELECT * FROM membership_levels WHERE id = ?', [req.params.id]) as MembershipLevel;
    res.json(level);
  } catch (error) {
    console.error('更新會員等級錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 刪除會員等級（僅管理員）
router.delete('/levels/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    // 檢查是否有用戶使用此等級
    const users = await dbAll('SELECT * FROM users WHERE membership_level_id = ?', [req.params.id]) as User[];
    if (users.length > 0) {
      return res.status(400).json({ error: '無法刪除，仍有用戶使用此會員等級' });
    }

    await dbRun('DELETE FROM membership_levels WHERE id = ?', [req.params.id]);
    res.json({ message: '會員等級已刪除' });
  } catch (error) {
    console.error('刪除會員等級錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取用戶會員信息
router.get('/user/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // 只有管理員或本人可以查看
    if (req.userRole !== 'admin' && req.userId !== userId) {
      return res.status(403).json({ error: '無權限' });
    }

    let user: (User & { membership_name?: string; membership_description?: string; discount_percentage?: number; color?: string; icon?: string }) | undefined;
    try {
      user = await dbGet(
        `SELECT u.*, ml.name as membership_name, ml.description as membership_description, 
                ml.discount_percentage, ml.color, ml.icon 
         FROM users u 
         LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
         WHERE u.id = ?`,
        [userId]
      ) as (User & { membership_name?: string; membership_description?: string; discount_percentage?: number; color?: string; icon?: string }) | undefined;
    } catch (error) {
      // 如果JOIN失敗，只查詢用戶基本信息
      console.error('獲取會員等級信息失敗，使用基本信息:', error);
      user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]) as User | undefined;
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
    console.error('獲取用戶會員信息錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新用戶會員等級（僅管理員）
router.put('/user/:id/level', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { membership_level_id } = req.body;

    if (!membership_level_id) {
      return res.status(400).json({ error: '請提供會員等級ID' });
    }

    await dbRun(
      'UPDATE users SET membership_level_id = ? WHERE id = ?',
      [membership_level_id, req.params.id]
    );

    const user = await dbGet(
      `SELECT u.*, ml.name as membership_name, ml.description as membership_description, 
              ml.discount_percentage, ml.color, ml.icon 
       FROM users u 
       LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
       WHERE u.id = ?`,
      [req.params.id]
    ) as (User & { membership_name: string; membership_description: string; discount_percentage: number; color: string; icon: string });

    res.json(user);
  } catch (error) {
    console.error('更新用戶會員等級錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新用戶積分（僅管理員）
router.put('/user/:id/points', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { points } = req.body;

    if (points === undefined) {
      return res.status(400).json({ error: '請提供積分' });
    }

    await dbRun(
      'UPDATE users SET points = ? WHERE id = ?',
      [points, req.params.id]
    );

    // 根據積分自動更新會員等級
    const levels = await dbAll('SELECT * FROM membership_levels ORDER BY min_points DESC') as MembershipLevel[];
    for (const level of levels) {
      if (points >= level.min_points) {
        await dbRun(
          'UPDATE users SET membership_level_id = ? WHERE id = ?',
          [level.id, req.params.id]
        );
        break;
      }
    }

    const user = await dbGet(
      `SELECT u.*, ml.name as membership_name, ml.description as membership_description, 
              ml.discount_percentage, ml.color, ml.icon 
       FROM users u 
       LEFT JOIN membership_levels ml ON u.membership_level_id = ml.id 
       WHERE u.id = ?`,
      [req.params.id]
    ) as (User & { membership_name: string; membership_description: string; discount_percentage: number; color: string; icon: string });

    res.json(user);
  } catch (error) {
    console.error('更新用戶積分錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
