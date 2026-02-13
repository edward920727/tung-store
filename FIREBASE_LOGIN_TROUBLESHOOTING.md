# Firebase 登入問題解決指南

## 錯誤：`auth/invalid-credential`

這個錯誤表示 **郵箱或密碼錯誤**，或者 **用戶不存在**。

### 解決步驟

#### 1. 確認您是否已註冊
- **如果您是第一次使用**，請先前往註冊頁面創建帳戶
- 點擊登入頁面的「立即註冊」連結

#### 2. 檢查輸入的郵箱和密碼
- 確認郵箱格式正確（例如：`user@example.com`）
- 確認密碼正確（注意大小寫）
- 確認沒有多餘的空格

#### 3. 在 Firebase Console 中檢查用戶
1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `tung-315`
3. 進入 **Authentication** > **Users**
4. 查看是否有您的郵箱地址
5. 如果沒有，說明您還沒有註冊

#### 4. 測試註冊功能
1. 前往註冊頁面
2. 輸入：
   - 用戶名：`testuser`
   - 郵箱：`test@example.com`（使用真實郵箱）
   - 密碼：至少 6 個字符
3. 點擊註冊
4. 註冊成功後，使用相同的郵箱和密碼登入

#### 5. 重置密碼（如果已註冊但忘記密碼）
如果您的帳戶已存在但忘記密碼，可以：
1. 在 Firebase Console 中手動重置
2. 或使用 Firebase 的密碼重置功能（如果已實現）

### 常見問題

**Q: 為什麼會出現 `auth/invalid-credential` 錯誤？**
A: 這表示：
- 用戶不存在（最常見）
- 密碼錯誤
- 郵箱格式錯誤

**Q: 我確定郵箱和密碼是正確的，為什麼還是登入失敗？**
A: 請檢查：
1. Firebase Console 中是否有該用戶
2. 郵箱是否已驗證（如果 Firebase 要求驗證）
3. 是否有其他認證限制

**Q: 如何創建測試用戶？**
A: 
1. 在應用中註冊新帳戶
2. 或在 Firebase Console > Authentication > Users 中手動添加

### 下一步

1. **先註冊一個新帳戶**（如果還沒有）
2. **使用註冊時的郵箱和密碼登入**
3. **如果問題持續**，請檢查：
   - Firebase Console 中的用戶列表
   - 瀏覽器控制台的詳細錯誤訊息
   - Firebase Authentication 設置

### 檢查清單

- [ ] 已註冊帳戶
- [ ] 郵箱格式正確
- [ ] 密碼至少 6 個字符
- [ ] Firebase Console 中有該用戶
- [ ] Email/Password 認證已啟用
- [ ] 授權域名已添加（Vercel 域名）
