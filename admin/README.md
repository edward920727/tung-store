# Tung Store 管理後台

獨立的管理後台應用，與前台完全分離，可獨立部署。

## 功能

- 📊 儀表板 - 查看系統統計數據
- 🛍️ 產品管理 - 新增、編輯、刪除商品
- 📦 訂單管理 - 查看和更新訂單狀態
- 🎫 優惠券管理 - 管理優惠券
- ⭐ 會員等級 - 管理會員等級
- 👥 會員管理 - 管理用戶
- 🎨 首頁設計 - 自定義首頁配置

## 安裝

```bash
cd admin
npm install
```

## 開發

```bash
npm run dev
```

後台應用將在 http://localhost:3001 運行

## 構建

```bash
npm run build
```

構建後的文件在 `dist` 目錄中。

## 部署

可以將 `admin` 目錄部署到獨立的域名或子域名，例如：
- 前台：https://store.example.com
- 後台：https://admin.example.com

## 權限

只有 Firestore 中 `users` 集合的 `role === 'admin'` 的用戶才能訪問後台。

## 環境變量

可以在 `.env` 文件中設置：

```env
VITE_HEADQUARTERS_SECRET=your-secret-key-here
```

用於總部驗證功能。
