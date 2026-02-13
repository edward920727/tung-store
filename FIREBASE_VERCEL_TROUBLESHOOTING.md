# Firebase 登入問題排查指南

## 問題：Vercel 部署後登入失敗

### 1. 檢查 Firebase Console 設置

#### 1.1 啟用 Email/Password 認證
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案 `tung-315`
3. 進入 **Authentication** > **Sign-in method**
4. 確認 **Email/Password** 已啟用
5. 如果未啟用，點擊啟用並保存

#### 1.2 檢查授權域名
1. 在 Firebase Console 中，進入 **Authentication** > **Settings** > **Authorized domains**
2. 確認以下域名已添加：
   - `tung-store-kpoc.vercel.app` (您的 Vercel 域名)
   - `*.vercel.app` (如果需要)
   - `localhost` (開發環境)

### 2. 檢查 Firebase 配置

確認 `client/src/config/firebase.ts` 中的配置正確：
- `apiKey`: AIzaSyBNpAmZjxZgb9Ub7qZLH6htzgmKHXHWpiI
- `authDomain`: tung-315.firebaseapp.com
- `projectId`: tung-315

### 3. 檢查瀏覽器控制台錯誤

在 Vercel 部署的網站上：
1. 打開瀏覽器開發者工具 (F12)
2. 切換到 **Console** 標籤
3. 嘗試登入
4. 查看是否有錯誤訊息

常見錯誤：
- `auth/unauthorized-domain`: 域名未授權 → 需要在 Firebase Console 添加域名
- `auth/user-not-found`: 用戶不存在 → 需要先註冊
- `auth/wrong-password`: 密碼錯誤
- `auth/network-request-failed`: 網絡問題

### 4. 檢查 Firestore 安全規則

確認 Firestore 安全規則允許讀取用戶數據：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用戶可以讀取自己的數據
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 允許讀取會員等級
    match /membership_levels/{document=**} {
      allow read: if true;
    }
    
    // 允許讀取商品
    match /products/{document=**} {
      allow read: if true;
    }
    
    // 購物車 - 用戶只能訪問自己的購物車
    match /cart/{cartId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // 訂單 - 用戶只能訪問自己的訂單
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

### 5. 測試步驟

1. **在本地測試**
   ```bash
   cd client
   npm run dev
   ```
   訪問 `http://localhost:3000` 並嘗試登入

2. **檢查 Vercel 部署**
   - 訪問您的 Vercel URL
   - 打開瀏覽器控制台
   - 嘗試登入並查看錯誤

3. **創建測試用戶**
   - 如果沒有用戶，先註冊一個新帳戶
   - 然後嘗試登入

### 6. 常見解決方案

#### 方案 1: 添加授權域名
如果看到 `auth/unauthorized-domain` 錯誤：
1. 前往 Firebase Console > Authentication > Settings
2. 在 "Authorized domains" 中添加您的 Vercel 域名
3. 等待幾分鐘讓更改生效

#### 方案 2: 檢查網絡連接
- 確認瀏覽器可以訪問 Firebase 服務
- 檢查是否有防火牆或代理阻擋

#### 方案 3: 清除瀏覽器緩存
- 清除瀏覽器緩存和 Cookie
- 嘗試無痕模式

#### 方案 4: 檢查 Firebase 專案狀態
- 確認 Firebase 專案未暫停
- 確認帳單狀態正常

### 7. 調試代碼

在 `client/src/contexts/AuthContext.tsx` 中添加更詳細的日誌：

```typescript
const login = async (email: string, password: string) => {
  try {
    console.log('嘗試登入:', email);
    await signInWithEmailAndPassword(auth, email, password);
    console.log('登入成功');
  } catch (error: any) {
    console.error('登入失敗詳細信息:', {
      code: error.code,
      message: error.message,
      email: email
    });
    throw new Error(error.message || '登錄失敗');
  }
};
```

### 8. 聯繫支持

如果以上步驟都無法解決問題：
1. 檢查 Firebase Console 中的使用情況和錯誤日誌
2. 查看 Vercel 部署日誌
3. 提供具體的錯誤訊息以便進一步排查
