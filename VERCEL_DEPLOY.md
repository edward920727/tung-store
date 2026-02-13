# Vercel 部署指南

## 部署前端到 Vercel

### 步驟 1: 準備後端服務器

首先，您需要將後端部署到支持 Node.js 的服務器（如 Railway、Render、Heroku 等），並獲取後端的 URL。

### 步驟 2: 在 Vercel 部署前端

1. **連接到 Vercel**
   - 訪問 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 登錄
   - 導入您的項目

2. **配置項目設置**
   - **Root Directory**: 設置為 `client`
   - **Framework Preset**: 選擇 `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **設置環境變量**
   在 Vercel 項目設置中添加環境變量：
   - **Name**: `VITE_API_URL`
   - **Value**: 您的後端 API URL（例如：`https://your-backend.railway.app`）

   ⚠️ **重要**: 確保後端 URL 不包含尾隨斜杠 `/`

4. **部署**
   - 點擊 "Deploy"
   - 等待構建完成

### 步驟 3: 驗證部署

部署完成後，訪問您的 Vercel URL，應該能夠：
- 看到首頁
- 瀏覽商品
- 登錄/註冊（如果後端已正確配置）

## 常見問題

### 404 錯誤

如果遇到 404 錯誤，請檢查：

1. **React Router 路由問題**
   - 確保 `client/vercel.json` 文件存在且配置正確
   - 所有路由都應該重定向到 `index.html`

2. **API 請求失敗**
   - 檢查環境變量 `VITE_API_URL` 是否正確設置
   - 確認後端服務器正在運行
   - 檢查瀏覽器控制台的錯誤信息

3. **CORS 錯誤**
   - 確保後端已配置 CORS，允許來自 Vercel 域名的請求
   - 檢查後端的 `cors` 配置

### 環境變量設置

在 Vercel 中設置環境變量：
1. 進入項目設置
2. 點擊 "Environment Variables"
3. 添加 `VITE_API_URL` 並設置為您的後端 URL
4. 重新部署項目

## 後端部署建議

### Railway
1. 連接 GitHub 倉庫
2. 設置 Root Directory 為 `server`
3. 設置 Start Command 為 `npm start`
4. 確保已運行 `npm run build` 構建項目

### Render
1. 創建新的 Web Service
2. 設置 Root Directory 為 `server`
3. 設置 Build Command 為 `npm install && npm run build`
4. 設置 Start Command 為 `npm start`

## 注意事項

- 前端和後端需要分別部署
- 確保後端數據庫（SQLite）在生產環境中可訪問
- 考慮使用環境變量來管理敏感信息（如 JWT_SECRET）
- 定期備份數據庫
