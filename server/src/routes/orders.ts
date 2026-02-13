import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { Order, OrderItem, CartItem, Product } from '../database';

const router = express.Router();

// 獲取訂單列表
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    // 管理員可以查看所有訂單，普通用戶只能查看自己的訂單
    if (req.userRole !== 'admin') {
      query += ' AND user_id = ?';
      params.push(req.userId);
    }

    query += ' ORDER BY created_at DESC';

    const orders = await dbAll(query, params) as Order[];
    res.json(orders);
  } catch (error) {
    console.error('獲取訂單錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取單個訂單詳情
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    let query = 'SELECT * FROM orders WHERE id = ?';
    const params: any[] = [req.params.id];

    if (req.userRole !== 'admin') {
      query += ' AND user_id = ?';
      params.push(req.userId);
    }

    const order = await dbGet(query, params) as Order | undefined;

    if (!order) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    // 獲取訂單項
    const orderItems = await dbAll(
      `SELECT oi.*, p.name, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    ) as (OrderItem & { name: string; image_url: string })[];

    res.json({ ...order, items: orderItems });
  } catch (error) {
    console.error('獲取訂單錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 創建訂單（從購物車）
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // 獲取購物車商品
    const cartItems = await dbAll(
      `SELECT c.*, p.name, p.price, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [req.userId]
    ) as (CartItem & Product)[];

    if (cartItems.length === 0) {
      return res.status(400).json({ error: '購物車為空' });
    }

    // 檢查庫存
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ error: `商品 ${item.name} 庫存不足` });
      }
    }

    // 計算總金額
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 創建訂單
    const orderResult = await dbRun(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.userId, totalAmount, 'pending']
    );

    const orderId = (orderResult as any).lastID;

    // 創建訂單項並更新庫存
    for (const item of cartItems) {
      await dbRun(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // 更新商品庫存
      await dbRun(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 清空購物車
    await dbRun('DELETE FROM cart WHERE user_id = ?', [req.userId]);

    // 更新用戶積分和總消費（每消費1元獲得1積分）
    const pointsEarned = Math.floor(totalAmount);
    await dbRun(
      'UPDATE users SET points = points + ?, total_spent = total_spent + ? WHERE id = ?',
      [pointsEarned, totalAmount, req.userId]
    );

    // 根據總消費自動更新會員等級
    try {
      const user = await dbGet('SELECT total_spent FROM users WHERE id = ?', [req.userId]) as { total_spent: number } | undefined;
      if (user) {
        const levels = await dbAll('SELECT * FROM membership_levels ORDER BY min_points DESC') as any[];
        if (levels && levels.length > 0) {
          for (const level of levels) {
            if (user.total_spent >= level.min_points) {
              await dbRun(
                'UPDATE users SET membership_level_id = ? WHERE id = ?',
                [level.id, req.userId]
              );
              break;
            }
          }
        }
      }
    } catch (error) {
      // 如果會員等級表不存在或查詢失敗，記錄錯誤但不影響訂單創建
      console.error('更新會員等級失敗:', error);
    }

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]) as Order;
    res.status(201).json(order);
  } catch (error) {
    console.error('創建訂單錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新訂單狀態（僅管理員）
router.put('/:id/status', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: '無效的訂單狀態' });
    }

    await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]) as Order;
    res.json(order);
  } catch (error) {
    console.error('更新訂單錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
