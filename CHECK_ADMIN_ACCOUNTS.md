# 檢查哪些帳號有後台權限

## 方法 1: 在 Firebase Console 中查看（最直接）

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `tung-315`
3. 進入 **Firestore Database**
4. 點擊 `users` 集合
5. 查看所有用戶文檔
6. 找到 `role` 字段為 `admin` 的用戶
7. 查看該用戶的 `email` 字段，這就是有後台權限的帳號

## 方法 2: 在應用中查看（如果已登入管理員）

1. 登入任何管理員帳號
2. 進入「管理後台」
3. 點擊「會員管理」標籤
4. 查看「角色」欄，顯示「管理員」的帳號就是有後台權限的

## 方法 3: 使用瀏覽器控制台查詢

1. 登入您的帳號
2. 打開瀏覽器開發者工具 (F12)
3. 在 Console 中執行以下代碼：

```javascript
// 這需要 Firebase SDK，但可以通過 Network 標籤查看 API 請求
// 或者直接在 Firestore Console 中查看
```

## 快速檢查步驟

1. **Firebase Console** > **Firestore Database** > **users** 集合
2. 查看每個用戶文檔的 `role` 字段
3. `role: "admin"` = 有後台權限
4. `role: "user"` = 普通用戶

## 如果沒有管理員

如果所有用戶的 `role` 都是 `user`，需要手動設置一個：

1. 在 Firestore 中找到要設為管理員的用戶文檔
2. 點擊編輯
3. 將 `role` 字段改為 `admin`
4. 保存
5. 刷新網頁，重新登入
