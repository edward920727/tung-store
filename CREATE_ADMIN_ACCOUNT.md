# 創建新的管理員帳號指南

## 目標
- 刪除舊帳號
- 創建新帳號：315727@gmail.com / 315727
- 設置為管理員

## 步驟 1: 刪除舊的 Firebase Authentication 用戶

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `tung-315`
3. 進入 **Authentication** > **Users**
4. 找到舊的用戶帳號（通過郵箱查找）
5. 點擊用戶右側的 **⋮** (三個點)
6. 選擇 **Delete user**
7. 確認刪除

## 步驟 2: 刪除 Firestore 中的用戶文檔

1. 在 Firebase Console 中，進入 **Firestore Database**
2. 點擊 `users` 集合
3. 找到對應的用戶文檔（可以通過 email 字段查找）
4. 點擊文檔，然後點擊 **Delete** 按鈕
5. 確認刪除

## 步驟 3: 註冊新帳號

1. 前往您的網站（Vercel 部署地址）
2. 點擊「註冊」
3. 填寫：
   - **用戶名**: `admin` 或任意名稱
   - **郵箱**: `315727@gmail.com`
   - **密碼**: `315727`
4. 點擊「註冊」

## 步驟 4: 設置為管理員

由於這是第一個註冊的用戶（如果已刪除舊用戶），系統會自動將其設為管理員。

如果沒有自動設置，請手動設置：

1. 在 Firebase Console 中，進入 **Firestore Database**
2. 點擊 `users` 集合
3. 找到新註冊的用戶文檔（email: 315727@gmail.com）
4. 點擊文檔進入編輯
5. 找到 `role` 字段
6. 將值改為 `admin`
7. 點擊「更新」保存

## 步驟 5: 驗證

1. 登出當前帳號
2. 使用新帳號登入：
   - 郵箱：315727@gmail.com
   - 密碼：315727
3. 檢查導航欄是否出現「管理後台」連結
4. 點擊「管理後台」確認可以訪問

## 注意事項

- 確保已完全刪除舊用戶（Authentication 和 Firestore 都要刪除）
- 新註冊的用戶如果是第一個用戶，會自動成為管理員
- 如果有多個用戶，需要手動在 Firestore 中設置 role 為 admin
