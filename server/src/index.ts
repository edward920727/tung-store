import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import couponRoutes from './routes/coupons';
import membershipRoutes from './routes/membership';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/membership', membershipRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '小童服飾API運行正常' });
});

// 全局错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('未處理的錯誤:', err);
  res.status(500).json({ error: '伺服器內部錯誤', message: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '路由不存在' });
});

// 初始化数据库并启动服务器
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
    console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  console.error('❌ 資料庫初始化失敗:', error);
  console.error('錯誤詳情:', error instanceof Error ? error.stack : error);
  process.exit(1);
});
