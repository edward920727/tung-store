# Firebase Storage 設置指南

## 問題：CORS 錯誤

如果遇到以下錯誤：
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## 解決方案

### 1. 設置 Firebase Storage 安全規則

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案 `tung-315`
3. 進入 **Storage** > **Rules** 標籤
4. 設置以下規則：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 允許已登入的管理員上傳圖片
    match /homepage/{allPaths=**} {
      allow read: if true; // 所有人可以讀取
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 允許已登入的管理員上傳商品圖片
    match /products/{allPaths=**} {
      allow read: if true; // 所有人可以讀取
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 其他路徑：僅管理員可寫，所有人可讀
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 2. 確認用戶已登入

確保在上傳圖片時：
- 用戶已通過 Firebase Authentication 登入
- 用戶在 Firestore 的 `users` 集合中有對應的文檔
- 用戶的 `role` 欄位為 `'admin'`

### 3. 檢查 Firebase Storage 是否已啟用

1. 在 Firebase Console 中，進入 **Storage**
2. 如果看到「Get started」按鈕，點擊啟用 Storage
3. 選擇「Start in test mode」或「Start in production mode」

### 4. 測試步驟

1. **確認已登入管理員帳號**
   - 在應用中登入管理員帳號
   - 確認 `firebaseUser` 不為 null

2. **嘗試上傳圖片**
   - 進入「首頁設計」頁面
   - 嘗試上傳 Hero 背景圖片或輪播圖片

3. **檢查瀏覽器控制台**
   - 打開開發者工具 (F12)
   - 查看 Console 和 Network 標籤
   - 確認是否有其他錯誤訊息

### 5. 常見錯誤及解決方法

#### 錯誤：`storage/unauthorized`
**原因：** 用戶未登入或不是管理員
**解決：** 
- 確認已登入
- 確認用戶角色為 `admin`

#### 錯誤：`storage/quota-exceeded`
**原因：** Storage 配額已滿
**解決：** 
- 檢查 Firebase 配額使用情況
- 刪除不需要的圖片
- 升級 Firebase 方案

#### 錯誤：`storage/unknown`
**原因：** 網絡問題或 Firebase 配置錯誤
**解決：**
- 檢查網絡連接
- 確認 Firebase 配置正確
- 檢查 Firebase 專案狀態

### 6. 開發環境測試規則（僅用於開發）

如果需要快速測試，可以使用以下寬鬆規則（**不建議用於生產環境**）：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**注意：** 此規則允許所有已登入用戶上傳，請僅在開發時使用。

### 7. 驗證設置

完成設置後，請：
1. 重新載入應用
2. 確認已登入管理員帳號
3. 嘗試上傳圖片
4. 檢查是否成功

如果仍有問題，請檢查：
- Firebase Console 中的 Storage 規則是否已保存
- 用戶是否已正確登入
- 瀏覽器控制台是否有其他錯誤訊息
