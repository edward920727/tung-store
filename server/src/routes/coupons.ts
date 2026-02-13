import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { Coupon } from '../database';

const router = express.Router();

// 獲取所有優惠券
router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    let query = 'SELECT * FROM coupons WHERE 1=1';
    const params: any[] = [];

    if (active_only === 'true') {
      query += ' AND is_active = 1 AND datetime(valid_from) <= datetime("now") AND datetime(valid_until) >= datetime("now")';
    }

    query += ' ORDER BY created_at DESC';

    const coupons = await dbAll(query, params) as Coupon[];
    res.json(coupons);
  } catch (error) {
    console.error('獲取優惠券錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取單個優惠券
router.get('/:id', async (req, res) => {
  try {
    const coupon = await dbGet('SELECT * FROM coupons WHERE id = ?', [req.params.id]) as Coupon | undefined;
    
    if (!coupon) {
      return res.status(404).json({ error: '優惠券不存在' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('獲取優惠券錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 驗證優惠券
router.post('/validate', async (req, res) => {
  try {
    const { code, total_amount } = req.body;

    if (!code) {
      return res.status(400).json({ error: '請提供優惠券代碼' });
    }

    const coupon = await dbGet(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND is_active = 1 
       AND datetime(valid_from) <= datetime("now") 
       AND datetime(valid_until) >= datetime("now")`,
      [code]
    ) as Coupon | undefined;

    if (!coupon) {
      return res.status(404).json({ error: '優惠券不存在或已過期' });
    }

    // 檢查使用次數限制
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: '優惠券已達使用上限' });
    }

    // 檢查最低消費金額
    if (coupon.min_purchase && total_amount < coupon.min_purchase) {
      return res.status(400).json({ 
        error: `此優惠券需消費滿¥${coupon.min_purchase}才能使用` 
      });
    }

    // 計算折扣金額
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (total_amount * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount: discount
      }
    });
  } catch (error) {
    console.error('驗證優惠券錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 創建優惠券（僅管理員）
router.post('/', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      valid_from,
      valid_until,
      usage_limit,
      is_active
    } = req.body;

    if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
      return res.status(400).json({ error: '請提供完整的優惠券信息' });
    }

    // 檢查代碼是否已存在
    const existing = await dbGet('SELECT * FROM coupons WHERE code = ?', [code]) as Coupon | undefined;
    if (existing) {
      return res.status(400).json({ error: '優惠券代碼已存在' });
    }

    const result = await dbRun(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, valid_from, valid_until, usage_limit, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        description || '',
        discount_type,
        discount_value,
        min_purchase || null,
        max_discount || null,
        valid_from,
        valid_until,
        usage_limit || null,
        is_active !== undefined ? is_active : 1
      ]
    );

    const couponId = (result as any).lastID;
    const coupon = await dbGet('SELECT * FROM coupons WHERE id = ?', [couponId]) as Coupon;
    res.status(201).json(coupon);
  } catch (error) {
    console.error('創建優惠券錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新優惠券（僅管理員）
router.put('/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      valid_from,
      valid_until,
      usage_limit,
      is_active
    } = req.body;

    await dbRun(
      `UPDATE coupons SET 
       code = ?, description = ?, discount_type = ?, discount_value = ?, 
       min_purchase = ?, max_discount = ?, valid_from = ?, valid_until = ?, 
       usage_limit = ?, is_active = ? 
       WHERE id = ?`,
      [
        code,
        description,
        discount_type,
        discount_value,
        min_purchase || null,
        max_discount || null,
        valid_from,
        valid_until,
        usage_limit || null,
        is_active !== undefined ? is_active : 1,
        req.params.id
      ]
    );

    const coupon = await dbGet('SELECT * FROM coupons WHERE id = ?', [req.params.id]) as Coupon;
    res.json(coupon);
  } catch (error) {
    console.error('更新優惠券錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 刪除優惠券（僅管理員）
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    await dbRun('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ message: '優惠券已刪除' });
  } catch (error) {
    console.error('刪除優惠券錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 使用優惠券（增加使用次數）
router.post('/:id/use', async (req, res) => {
  try {
    await dbRun(
      'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: '優惠券使用記錄已更新' });
  } catch (error) {
    console.error('更新優惠券使用次數錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
