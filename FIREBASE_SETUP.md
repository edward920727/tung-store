# Firebase 設置指南

## 📦 已完成的配置

1. ✅ Firebase 配置文件已創建：`client/src/config/firebase.ts`
2. ✅ Firebase 配置已添加（使用您提供的配置）

## 🚀 安裝 Firebase SDK

在 `client` 目錄下運行：

```bash
cd client
npm install firebase
```

## 💡 Firebase 使用選項

### 選項 1：使用 Firebase Hosting 部署前端

如果您想使用 Firebase Hosting 替代 Vercel：

1. **安裝 Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **登錄 Firebase**
   ```bash
   firebase login
   ```

3. **初始化 Firebase Hosting**
   ```bash
   cd client
   firebase init hosting
   ```

4. **部署**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### 選項 2：使用 Firebase 功能（保留 Express 後端）

可以集成 Firebase 的特定功能：

- **Firebase Authentication** - 用戶認證
- **Firebase Storage** - 圖片/文件存儲
- **Firebase Analytics** - 網站分析
- **Firebase Firestore** - 數據庫（替代 SQLite）

### 選項 3：完全使用 Firebase 作為後端

這需要重寫後端邏輯，使用：
- Firebase Authentication
- Firestore Database
- Cloud Functions（替代 Express API）

## ⚠️ 重要提示

**當前項目使用 Express + SQLite 作為後端**

如果您想：
- **保留現有後端**：只需要安裝 Firebase SDK，然後選擇要使用的功能
- **完全替換後端**：這是一個重大架構改變，需要重寫大量代碼

## 📝 下一步

請告訴我您想要：
1. 使用 Firebase Hosting 部署前端？
2. 集成 Firebase 的特定功能（如 Storage、Analytics）？
3. 完全使用 Firebase 替代 Express 後端？

根據您的選擇，我可以提供具體的實現步驟。
