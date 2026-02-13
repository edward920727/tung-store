# 如何設置管理員權限

## 問題
新註冊的用戶默認 role 是 `'user'`，無法訪問管理後台。需要將 role 改為 `'admin'`。

## 解決方法

### 方法 1: 在 Firebase Console 中手動設置（最簡單）

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `tung-315`
3. 進入 **Firestore Database**
4. 找到 `users` 集合
5. 找到您的用戶文檔（文檔 ID 是您的 Firebase UID）
6. 點擊編輯，將 `role` 字段從 `user` 改為 `admin`
7. 保存

### 方法 2: 在 Admin 頁面設置（如果已有管理員）

如果已經有管理員帳戶，可以在 Admin 頁面的「會員管理」標籤中：
1. 找到要設置為管理員的用戶
2. 點擊「編輯」
3. 在編輯表單中添加角色選擇功能（需要更新代碼）

### 方法 3: 使用瀏覽器控制台（臨時方案）

1. 登入您的帳戶
2. 打開瀏覽器開發者工具 (F12)
3. 在 Console 中執行以下代碼：

```javascript
// 獲取當前用戶 ID
const auth = firebase.auth();
const currentUser = auth.currentUser;
if (currentUser) {
  console.log('用戶 ID:', currentUser.uid);
  
  // 更新用戶角色為 admin
  // 注意：這需要在 Firestore 中執行，需要 Firebase Admin SDK
  // 或者使用 Firestore 的 Web SDK
}
```

### 方法 4: 創建第一個用戶自動設為管理員

修改註冊邏輯，讓第一個註冊的用戶自動成為管理員。

## 推薦方案

**最簡單的方法：在 Firebase Console 中手動設置**

步驟詳解：
1. 登入 Firebase Console
2. 選擇專案 `tung-315`
3. 左側菜單選擇 **Firestore Database**
4. 點擊 `users` 集合
5. 找到您的用戶文檔（可以通過 email 字段查找）
6. 點擊文檔進入編輯模式
7. 找到 `role` 字段
8. 將值從 `user` 改為 `admin`
9. 點擊「更新」保存
10. 刷新網頁，您應該能看到「管理後台」連結了

## 驗證

設置完成後：
1. 登出並重新登入
2. 檢查導航欄是否出現「管理後台」連結
3. 點擊「管理後台」應該能正常訪問
