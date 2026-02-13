# Firebase 遷移指南

## ✅ 已完成的遷移

1. ✅ Firebase SDK 已安裝
2. ✅ Firebase 配置已設置（Auth, Firestore, Storage）
3. ✅ Firestore 服務層已創建 (`client/src/services/firestore.ts`)
4. ✅ Firebase Authentication 已集成到 AuthContext
5. ✅ 初始化腳本已創建 (`client/src/services/initFirestore.ts`)
6. ✅ Products 頁面已更新使用 Firestore

## 📋 還需要完成的遷移

### 1. 更新所有頁面組件

需要將以下頁面從 axios 遷移到 Firestore：

- [ ] `client/src/pages/Cart.tsx` - 購物車
- [ ] `client/src/pages/Orders.tsx` - 訂單
- [ ] `client/src/pages/ProductDetail.tsx` - 商品詳情
- [ ] `client/src/pages/Admin.tsx` - 管理後台
- [ ] `client/src/pages/Membership.tsx` - 會員頁面
- [ ] `client/src/pages/Login.tsx` - 登錄頁面（可能需要更新錯誤處理）
- [ ] `client/src/pages/Register.tsx` - 註冊頁面（可能需要更新錯誤處理）

### 2. 在 Firebase Console 設置

#### 啟用 Authentication
1. 訪問 https://console.firebase.google.com
2. 選擇項目 `tung-315`
3. 進入 Authentication → Sign-in method
4. 啟用 **Email/Password** 認證方式

#### 設置 Firestore 安全規則
1. 進入 Firestore Database
2. 點擊 Rules 標籤
3. 設置以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用戶只能讀寫自己的數據
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 商品：所有人可讀，僅管理員可寫
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 購物車：用戶只能訪問自己的購物車
    match /cart/{cartId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // 訂單：用戶只能訪問自己的訂單
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.user_id == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && 
        request.resource.data.user_id == request.auth.uid;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 會員等級：所有人可讀，僅管理員可寫
    match /membership_levels/{levelId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 優惠券：所有人可讀，僅管理員可寫
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 3. 創建管理員用戶

在 Firebase Console 中：
1. 進入 Authentication → Users
2. 手動添加一個管理員用戶（email: admin@example.com）
3. 然後在 Firestore 中手動創建對應的用戶文檔，設置 `role: 'admin'`

或者，在應用中創建第一個用戶後，手動在 Firestore 中修改其 `role` 為 `admin`。

### 4. 數據遷移（可選）

如果需要從 SQLite 遷移現有數據：
1. 導出 SQLite 數據
2. 編寫遷移腳本將數據導入 Firestore
3. 或者手動在 Firebase Console 中創建數據

## 🔧 技術變更說明

### 認證方式變更
- **之前**: JWT Token (Express + bcrypt)
- **現在**: Firebase Authentication

### 數據庫變更
- **之前**: SQLite (關係型數據庫)
- **現在**: Firestore (NoSQL 文檔數據庫)

### API 調用變更
- **之前**: HTTP REST API (axios)
- **現在**: Firestore SDK (直接客戶端調用)

## ⚠️ 重要注意事項

1. **不再需要 Express 後端** - 所有邏輯都在客戶端
2. **Firestore 安全規則很重要** - 必須正確設置以防止未授權訪問
3. **數據結構變化** - ID 從數字變為字符串
4. **實時更新** - 可以使用 Firestore 的實時監聽功能

## 🚀 部署

### 前端部署（Vercel）
1. 移除 `VITE_API_URL` 環境變量（不再需要）
2. 重新部署

### Firebase Hosting（可選）
也可以使用 Firebase Hosting 部署前端：
```bash
cd client
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

## 📝 下一步

1. 完成所有頁面的遷移
2. 設置 Firestore 安全規則
3. 測試所有功能
4. 部署到生產環境
