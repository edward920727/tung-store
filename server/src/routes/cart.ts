import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CartItem, Product } from '../database';

const router = express.Router();

// 獲取購物車
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const cartItems = await dbAll(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [req.userId]
    ) as (CartItem & Product)[];

    res.json(cartItems);
  } catch (error) {
    console.error('獲取購物車錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 添加商品到購物車
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: '請提供商品ID和數量' });
    }

    // 檢查商品是否存在
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [product_id]) as Product | undefined;
    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    // 檢查庫存
    if (product.stock < quantity) {
      return res.status(400).json({ error: '庫存不足' });
    }

    // 檢查購物車中是否已有該商品
    const existingItem = await dbGet(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [req.userId, product_id]
    ) as CartItem | undefined;

    if (existingItem) {
      // 更新數量
      await dbRun(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity, existingItem.id]
      );
    } else {
      // 添加新商品
      await dbRun(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.userId, product_id, quantity]
      );
    }

    res.json({ message: '商品已添加到購物車' });
  } catch (error) {
    console.error('添加購物車錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新購物車商品數量
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: '數量必須大於0' });
    }

    // 檢查購物車項是否屬於當前用戶
    const cartItem = await dbGet('SELECT * FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.userId]) as CartItem | undefined;
    if (!cartItem) {
      return res.status(404).json({ error: '購物車項不存在' });
    }

    // 檢查庫存
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [cartItem.product_id]) as Product | undefined;
    if (!product || product.stock < quantity) {
      return res.status(400).json({ error: '庫存不足' });
    }

    await dbRun('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ message: '購物車已更新' });
  } catch (error) {
    console.error('更新購物車錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 從購物車刪除商品
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await dbRun('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: '商品已從購物車刪除' });
  } catch (error) {
    console.error('刪除購物車錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 清空購物車
router.delete('/', authenticate, async (req: AuthRequest, res) => {
  try {
    await dbRun('DELETE FROM cart WHERE user_id = ?', [req.userId]);
    res.json({ message: '購物車已清空' });
  } catch (error) {
    console.error('清空購物車錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
