# 時尚女裝電商平台

一個完整的全棧電商系統，專注於女裝銷售，包含前端React應用和後端Node.js API。這是一個可定制的電商模板，適合各種服裝零售業務。

## 功能特性

### 用戶功能
- ✅ 用戶註冊和登錄
- ✅ 商品瀏覽和搜尋
- ✅ 商品分類篩選
- ✅ 商品詳情查看
- ✅ 購物車管理
- ✅ 訂單創建和查看
- ✅ 訂單狀態追蹤

### 管理員功能
- ✅ 商品管理（增刪改查）
- ✅ 訂單管理
- ✅ 訂單狀態更新

## 技術棧

### 後端
- **Node.js** + **Express** - 伺服器框架
- **TypeScript** - 類型安全
- **SQLite** - 資料庫
- **JWT** - 用戶認證
- **bcryptjs** - 密碼加密

### 前端
- **React** - UI框架
- **TypeScript** - 類型安全
- **React Router** - 路由管理
- **Axios** - HTTP客戶端
- **Tailwind CSS** - 樣式框架
- **Vite** - 構建工具

## 項目結構

```
.
├── server/                 # 後端代碼
│   ├── src/
│   │   ├── index.ts       # 伺服器入口
│   │   ├── database.ts    # 資料庫配置和初始化
│   │   ├── middleware/    # 中間件
│   │   │   └── auth.ts    # 認證中間件
│   │   └── routes/        # API路由
│   │       ├── auth.ts    # 認證路由
│   │       ├── products.ts # 商品路由
│   │       ├── cart.ts    # 購物車路由
│   │       ├── orders.ts  # 訂單路由
│   │       └── users.ts   # 用戶路由
│   ├── package.json
│   └── tsconfig.json
├── client/                # 前端代碼
│   ├── src/
│   │   ├── components/    # React組件
│   │   ├── contexts/      # React Context
│   │   ├── pages/         # 頁面組件
│   │   ├── App.tsx        # 主應用組件
│   │   └── main.tsx       # 入口文件
│   ├── package.json
│   └── vite.config.ts
└── package.json           # 根目錄配置
```

## 安裝和運行

### 前置要求
- Node.js (v16 或更高版本)
- npm 或 yarn

### 安裝依賴

```bash
# 安裝所有依賴（根目錄、伺服器和客戶端）
npm run install:all
```

或者分別安裝：

```bash
# 安裝根目錄依賴
npm install

# 安裝伺服器依賴
cd server
npm install

# 安裝客戶端依賴
cd ../client
npm install
```

### 運行項目

#### 方式一：同時運行前後端（推薦）

在根目錄運行：

```bash
npm run dev
```

這將同時啟動：
- 後端伺服器：http://localhost:5000
- 前端開發伺服器：http://localhost:3000

#### 方式二：分別運行

**啟動後端：**
```bash
cd server
npm run dev
```

**啟動前端：**
```bash
cd client
npm run dev
```

## 默認帳戶

系統會自動創建默認管理員帳戶：

- **用戶名**: admin
- **郵箱**: admin@example.com
- **密碼**: admin123

⚠️ **注意**: 在生產環境中請務必修改默認密碼！

## API 端點

### 認證
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登錄

### 商品
- `GET /api/products` - 獲取商品列表（支持搜尋和分類篩選）
- `GET /api/products/:id` - 獲取商品詳情
- `GET /api/products/categories/list` - 獲取所有分類
- `POST /api/products` - 創建商品（需要管理員權限）
- `PUT /api/products/:id` - 更新商品（需要管理員權限）
- `DELETE /api/products/:id` - 刪除商品（需要管理員權限）

### 購物車
- `GET /api/cart` - 獲取購物車（需要登錄）
- `POST /api/cart` - 添加商品到購物車（需要登錄）
- `PUT /api/cart/:id` - 更新購物車商品數量（需要登錄）
- `DELETE /api/cart/:id` - 從購物車刪除商品（需要登錄）
- `DELETE /api/cart` - 清空購物車（需要登錄）

### 訂單
- `GET /api/orders` - 獲取訂單列表（需要登錄）
- `GET /api/orders/:id` - 獲取訂單詳情（需要登錄）
- `POST /api/orders` - 創建訂單（需要登錄）
- `PUT /api/orders/:id/status` - 更新訂單狀態（需要管理員權限）

### 用戶
- `GET /api/users/me` - 獲取當前用戶信息（需要登錄）
- `GET /api/users` - 獲取所有用戶（需要管理員權限）

## 資料庫

系統使用 SQLite 資料庫，資料庫文件會自動創建在 `server/ecommerce.db`。

資料庫包含以下表：
- `users` - 用戶表
- `products` - 商品表
- `cart` - 購物車表
- `orders` - 訂單表
- `order_items` - 訂單項表

首次運行時會自動初始化資料庫並創建示例數據。

## 環境變量

可以在 `server` 目錄下創建 `.env` 文件來配置環境變量：

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## 構建生產版本

### 構建後端
```bash
cd server
npm run build
npm start
```

### 構建前端
```bash
cd client
npm run build
```

構建後的文件在 `client/dist` 目錄中。

## 開發說明

- 後端使用 TypeScript 編寫，提供類型安全
- 前端使用 React Hooks 和 Context API 進行狀態管理
- 使用 JWT 進行用戶認證，令牌存儲在 localStorage
- 所有 API 請求都需要在請求頭中包含認證令牌（除了登錄和註冊）
- 管理員路由需要用戶角色為 'admin'

## 許可證

MIT

## 貢獻

歡迎提交 Issue 和 Pull Request！
