# 設置後端 URL 配置指南

## 📋 快速設置步驟

### 在 Vercel 設置環境變量

1. **登錄 Vercel**
   - 訪問 https://vercel.com
   - 登錄您的帳號

2. **進入項目設置**
   - 找到項目 `tung-store`
   - 點擊項目 → Settings → Environment Variables

3. **添加環境變量**
   ```
   Key: VITE_API_URL
   Value: https://your-backend-url.railway.app
   Environment: Production (或 All)
   ```

4. **重新部署**
   - 點擊 Deployments → 找到最新部署 → ... → Redeploy

## 🚀 部署後端（如果還沒部署）

### 使用 Railway（推薦）

1. 訪問 https://railway.app
2. 使用 GitHub 登錄
3. New Project → Deploy from GitHub repo
4. 選擇您的倉庫
5. 設置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. 部署完成後複製 URL

### 使用 Render

1. 訪問 https://render.com
2. 使用 GitHub 登錄
3. New → Web Service
4. 連接 GitHub 倉庫
5. 設置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. 部署完成後複製 URL

## ✅ 驗證設置

設置完成後，檢查：

1. **前端請求是否正確**
   - 打開瀏覽器開發者工具
   - 查看 Network 標籤
   - 確認 API 請求發送到正確的後端 URL

2. **後端是否正常運行**
   - 訪問 `https://your-backend-url/api/health`
   - 應該看到：`{"status":"ok","message":"小童服飾API運行正常"}`

## ⚠️ 重要提示

- **URL 不要包含尾隨斜杠** `/`
  - ✅ 正確：`https://your-backend.railway.app`
  - ❌ 錯誤：`https://your-backend.railway.app/`

- **環境變量名稱必須是** `VITE_API_URL`
  - Vite 只會讀取以 `VITE_` 開頭的環境變量

- **設置後必須重新部署**
  - 環境變量只在構建時生效
  - 修改後需要重新部署才能生效

## 🔍 故障排查

### 問題：仍然出現 405 錯誤

**檢查：**
1. 環境變量是否正確設置
2. 是否已重新部署
3. 後端 URL 是否可訪問
4. 後端 CORS 是否正確配置

### 問題：CORS 錯誤

**解決：**
- 確保後端的 CORS 配置允許您的 Vercel 域名
- 檢查 `server/src/index.ts` 中的 CORS 設置

### 問題：找不到環境變量

**檢查：**
1. 環境變量名稱是否為 `VITE_API_URL`（必須以 `VITE_` 開頭）
2. 是否在正確的環境中設置（Production/Preview/Development）
3. 是否已重新部署項目
