# Firebase Storage CORS 設置指南

## 問題說明

當從 Vercel 網域或本地開發環境上傳圖片到 Firebase Storage 時，可能會遇到 CORS（跨來源資源共享）錯誤。這需要通過設置 Firebase Storage 的 CORS 規則來解決。

## 解決方案：使用 Google Cloud CLI (gsutil)

### 步驟 1：安裝 Google Cloud SDK

#### Windows 系統

1. **下載 Google Cloud SDK**
   - 前往：https://cloud.google.com/sdk/docs/install
   - 下載 Windows 安裝程式
   - 執行安裝程式並按照指示完成安裝

2. **或使用 Chocolatey（如果已安裝）**
   ```powershell
   choco install gcloudsdk
   ```

#### macOS 系統

```bash
# 使用 Homebrew
brew install --cask google-cloud-sdk

# 或下載安裝程式
# https://cloud.google.com/sdk/docs/install
```

#### Linux 系統

```bash
# 下載並安裝
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 步驟 2：初始化 Google Cloud SDK

1. **打開終端機（Windows: PowerShell 或 CMD）**

2. **初始化 gcloud**
   ```bash
   gcloud init
   ```

3. **按照提示操作：**
   - 選擇或創建 Google Cloud 專案
   - 選擇專案 ID：`tung-315`（或您的 Firebase 專案 ID）
   - 選擇預設區域（可選）

4. **登入 Google 帳號**
   ```bash
   gcloud auth login
   ```
   這會打開瀏覽器，請登入與 Firebase 專案關聯的 Google 帳號

5. **設置應用程式認證（用於 gsutil）**
   ```bash
   gcloud auth application-default login
   ```

### 步驟 3：確認 Firebase Storage Bucket 名稱

1. **前往 Firebase Console**
   - https://console.firebase.google.com/
   - 選擇專案 `tung-315`

2. **進入 Storage**
   - 點擊左側選單的 **Storage**
   - 查看 Storage 頁面，您會看到 bucket 名稱
   - 通常格式為：`tung-315.firebasestorage.app` 或 `tung-315.appspot.com`

3. **或使用 gcloud 命令查看**
   ```bash
   gcloud storage buckets list --project=tung-315
   ```

### 步驟 4：設置 CORS 規則

1. **確認 cors.json 文件位置**
   - 確保 `cors.json` 文件在當前目錄
   - 或使用完整路徑

2. **應用 CORS 設定**
   ```bash
   # 替換 YOUR_BUCKET_NAME 為實際的 bucket 名稱
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```

   **範例：**
   ```bash
   # 如果 bucket 名稱是 tung-315.firebasestorage.app
   gsutil cors set cors.json gs://tung-315.firebasestorage.app
   
   # 或如果是 tung-315.appspot.com
   gsutil cors set cors.json gs://tung-315.appspot.com
   ```

3. **驗證設定是否成功**
   ```bash
   gsutil cors get gs://YOUR_BUCKET_NAME
   ```

   應該會看到類似以下的輸出：
   ```json
   [
     {
       "origin": [
         "https://tung-store-kpoc.vercel.app",
         "https://*.vercel.app",
         "http://localhost:3000",
         ...
       ],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       ...
     }
   ]
   ```

### 步驟 5：測試上傳功能

1. **重新載入應用**
   - 清除瀏覽器緩存（Ctrl+Shift+Delete 或 Cmd+Shift+Delete）
   - 重新載入頁面

2. **嘗試上傳圖片**
   - 進入「首頁設計」頁面
   - 嘗試上傳 Hero 背景圖片或輪播圖片

3. **檢查瀏覽器控制台**
   - 打開開發者工具 (F12)
   - 查看 Console 標籤，確認沒有 CORS 錯誤

## 常見問題排查

### 問題 1：找不到 gsutil 命令

**解決方法：**
```bash
# 確認 gcloud 已正確安裝
gcloud --version

# 如果已安裝但找不到 gsutil，嘗試：
gcloud components install gsutil

# 或使用完整路徑
# Windows: C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gsutil.cmd
# macOS/Linux: /usr/local/bin/gsutil
```

### 問題 2：權限錯誤

**錯誤訊息：** `AccessDeniedException: 403 Forbidden`

**解決方法：**
1. 確認已登入正確的 Google 帳號
   ```bash
   gcloud auth list
   ```

2. 確認帳號有 Firebase Storage 的管理權限
   - 前往 Firebase Console > 專案設置 > 用戶和權限
   - 確認您的帳號有「Owner」或「Editor」權限

3. 重新認證
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

### 問題 3：找不到 bucket

**錯誤訊息：** `BucketNotFoundException`

**解決方法：**
1. 確認 bucket 名稱正確
   ```bash
   gcloud storage buckets list --project=tung-315
   ```

2. 確認專案 ID 正確
   ```bash
   gcloud config get-value project
   ```

3. 如果專案 ID 不正確，設置正確的專案
   ```bash
   gcloud config set project tung-315
   ```

### 問題 4：CORS 設定後仍然有錯誤

**解決方法：**
1. **清除瀏覽器緩存**
   - 完全關閉瀏覽器
   - 重新打開並清除緩存

2. **確認 CORS 設定已正確應用**
   ```bash
   gsutil cors get gs://YOUR_BUCKET_NAME
   ```

3. **檢查網域是否在允許列表中**
   - 確認您的 Vercel 網域已添加到 `cors.json` 的 `origin` 陣列中

4. **檢查 Firebase Storage 安全規則**
   - 前往 Firebase Console > Storage > Rules
   - 確認規則允許上傳（參考 `FIREBASE_STORAGE_SETUP.md`）

## 更新 CORS 設定

如果需要添加新的網域：

1. **編輯 cors.json**
   ```json
   {
     "origin": [
       "https://tung-store-kpoc.vercel.app",
       "https://your-new-domain.com",  // 添加新網域
       ...
     ],
     ...
   }
   ```

2. **重新應用設定**
   ```bash
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```

3. **驗證更新**
   ```bash
   gsutil cors get gs://YOUR_BUCKET_NAME
   ```

## 快速參考命令

```bash
# 查看當前專案
gcloud config get-value project

# 設置專案
gcloud config set project tung-315

# 查看所有 buckets
gcloud storage buckets list --project=tung-315

# 應用 CORS 設定
gsutil cors set cors.json gs://YOUR_BUCKET_NAME

# 查看當前 CORS 設定
gsutil cors get gs://YOUR_BUCKET_NAME

# 刪除 CORS 設定（如果需要）
gsutil cors set [] gs://YOUR_BUCKET_NAME
```

## 注意事項

1. **CORS 設定是全域的**
   - 一個 bucket 只能有一個 CORS 設定
   - 更新設定會覆蓋之前的設定

2. **網域匹配**
   - `https://*.vercel.app` 會匹配所有 Vercel 子網域
   - 本地開發環境需要明確列出（localhost:3000, localhost:5173 等）

3. **安全性**
   - 不要將 `origin` 設置為 `["*"]`（允許所有來源）
   - 只添加您信任的網域

4. **測試環境**
   - 建議先在本地測試
   - 確認無誤後再應用到生產環境

## 完成後

設置完成後，您應該能夠：
- ✅ 從 Vercel 網域上傳圖片
- ✅ 從本地開發環境上傳圖片
- ✅ 不再看到 CORS 錯誤

如果仍有問題，請檢查：
1. Firebase Storage 安全規則是否正確設置
2. 用戶是否已登入管理員帳號
3. 瀏覽器控制台是否有其他錯誤訊息
