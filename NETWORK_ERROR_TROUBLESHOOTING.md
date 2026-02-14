# 網絡錯誤排查指南

## ERR_NAME_NOT_RESOLVED 錯誤

這個錯誤表示無法解析域名，通常由以下原因引起：

### 可能的原因

1. **API 配置問題**
   - 如果項目中使用了 `apiClient`，但 `VITE_API_URL` 環境變量未設置或設置錯誤
   - 嘗試連接到不存在的域名

2. **Firebase 連接問題**
   - Firebase 配置錯誤
   - 網絡連接問題
   - DNS 解析失敗

3. **開發環境代理問題**
   - Vite proxy 配置錯誤
   - 後端服務器未運行

### 解決方案

#### 方案 1: 檢查 Firebase 配置

1. 確認 `client/src/config/firebase.ts` 中的配置正確
2. 檢查 Firebase 項目是否正常運行
3. 確認網絡連接正常

#### 方案 2: 檢查 API 配置（如果使用）

如果您的項目使用後端 API：

1. **開發環境**：
   - 確認後端服務器正在運行（通常是 `localhost:5000`）
   - 檢查 `vite.config.ts` 中的 proxy 配置

2. **生產環境**：
   - 在 Vercel 環境變量中設置 `VITE_API_URL`
   - 確保 URL 格式正確（例如：`https://your-backend.railway.app`）
   - 不要包含尾隨斜杠

#### 方案 3: 檢查瀏覽器控制台

1. 打開瀏覽器開發者工具（F12）
2. 查看 Network 標籤
3. 找到失敗的請求
4. 檢查請求的 URL 是否正確

#### 方案 4: 檢查環境變量

如果使用 Vercel：

1. 進入 Vercel 項目設置
2. 檢查 Environment Variables
3. 確認 `VITE_API_URL` 是否設置（如果需要的話）
4. 確認值是否正確

### 當前項目配置

**重要**：此項目主要使用 **Firebase**，而不是傳統的後端 API。

- ✅ 數據存儲：Firebase Firestore
- ✅ 認證：Firebase Authentication
- ✅ 文件存儲：Firebase Storage
- ❌ 不需要傳統的後端 API 服務器

如果看到 `ERR_NAME_NOT_RESOLVED` 錯誤，可能是：

1. **Firebase 連接問題**：
   - 檢查網絡連接
   - 檢查 Firebase 配置是否正確
   - 確認 Firebase 項目狀態

2. **未使用的 API 配置**：
   - `api.ts` 文件存在但可能未被使用
   - 如果沒有使用，可以忽略相關錯誤

### 驗證步驟

1. **檢查 Firebase 連接**：
   ```javascript
   // 在瀏覽器控制台運行
   console.log('Firebase config:', firebase.app().options);
   ```

2. **檢查網絡請求**：
   - 打開 Network 標籤
   - 過濾 "Failed" 請求
   - 查看具體的錯誤 URL

3. **檢查控制台錯誤**：
   - 查看完整的錯誤堆棧
   - 確認錯誤來源

### 如果錯誤不影響功能

如果錯誤出現在：
- 未使用的 API 配置
- 第三方資源（如圖片 CDN）
- 分析工具

且不影響主要功能，可以暫時忽略。

### 需要幫助？

請提供：
1. 完整的錯誤信息
2. 錯誤發生的頁面
3. 瀏覽器控制台的 Network 標籤截圖
4. 具體的操作步驟

這樣我可以更準確地幫您診斷問題。
