# 修復用戶文檔問題

## 問題
Firebase Authentication 中已有用戶（UID: `9YZLtrJpgrY5aD6WcZSPG3zVSOW2`），但 Firestore 中沒有對應的用戶文檔。

## 解決方案

### 方法 1: 讓系統自動創建（推薦）

1. **刷新網頁或重新登入**
2. 系統會自動檢測到沒有用戶文檔，並創建一個
3. 如果這是第一個用戶，會自動設為管理員

### 方法 2: 在 Firebase Console 中手動創建

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `tung-315`
3. 進入 **Firestore Database**
4. 點擊 `users` 集合
5. 點擊「添加文檔」
6. **文檔 ID**: 輸入 `9YZLtrJpgrY5aD6WcZSPG3zVSOW2`（Firebase UID）
7. 添加以下字段：
   - `username` (string): `admin` 或任意名稱
   - `email` (string): `315727@gmail.com`
   - `role` (string): `admin`
   - `membership_level_id` (string): 需要先獲取一個會員等級 ID
   - `points` (number): `0`
   - `total_spent` (number): `0`
   - `created_at` (timestamp): 當前時間

### 方法 3: 刪除並重新註冊

1. 在 Firebase Console 中刪除 Authentication 用戶
2. 重新註冊，系統會自動創建 Firestore 文檔

## 獲取會員等級 ID

在創建用戶文檔前，需要先獲取一個會員等級 ID：

1. 在 Firestore Database 中，查看 `membership_levels` 集合
2. 選擇一個會員等級文檔
3. 複製其文檔 ID
4. 在創建用戶文檔時使用這個 ID 作為 `membership_level_id`

## 驗證

創建文檔後：
1. 刷新網頁
2. 重新登入
3. 檢查是否顯示「管理後台」按鈕
