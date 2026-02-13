import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';
import { Product } from '../database';

const router = express.Router();

// 獲取所有商品（支持搜尋和分類篩選）
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const products = await dbAll(query, params) as Product[];
    res.json(products);
  } catch (error) {
    console.error('獲取商品錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取所有分類（必須在 /:id 之前定義）
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await dbAll('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""') as { category: string }[];
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('獲取分類錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 獲取單個商品
router.get('/:id', async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]) as Product | undefined;
    
    if (!product) {
      return res.status(404).json({ error: '商品不存在' });
    }

    res.json(product);
  } catch (error) {
    console.error('獲取商品錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 創建商品（僅管理員）
router.post('/', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, price, stock, image_url, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: '請提供商品名稱和價格' });
    }

    const result = await dbRun(
      `INSERT INTO products (name, description, price, stock, image_url, category) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || '', price, stock || 0, image_url || '', category || '']
    );

    const productId = (result as any).lastID;
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [productId]) as Product;

    res.status(201).json(product);
  } catch (error) {
    console.error('創建商品錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新商品（僅管理員）
router.put('/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description, price, stock, image_url, category } = req.body;

    await dbRun(
      `UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ? 
       WHERE id = ?`,
      [name, description, price, stock, image_url, category, req.params.id]
    );

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]) as Product;
    res.json(product);
  } catch (error) {
    console.error('更新商品錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 刪除商品（僅管理員）
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    await dbRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: '商品已刪除' });
  } catch (error) {
    console.error('刪除商品錯誤:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

export default router;
