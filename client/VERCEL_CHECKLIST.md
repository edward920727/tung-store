# Vercel 部署檢查清單

## ✅ 已完成的配置

1. ✅ `vercel.json` 已創建並配置 SPA 路由重寫
2. ✅ TypeScript 類型定義已添加 (`src/vite-env.d.ts`)
3. ✅ API 配置支持環境變量 (`src/config/api.ts`)
4. ✅ 構建測試通過

## 📋 Vercel 部署步驟

### 1. 在 Vercel 創建項目

1. 訪問 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab/Bitbucket 登錄
3. 點擊 "Add New Project"
4. 導入您的倉庫

### 2. 配置項目設置

在 Vercel 項目設置中：

- **Framework Preset**: 選擇 `Vite` 或 `Other`
- **Root Directory**: 設置為 `client` ⚠️ **重要！**
- **Build Command**: `npm run build` (自動檢測)
- **Output Directory**: `dist` (自動檢測)
- **Install Command**: `npm install` (自動檢測)

### 3. 設置環境變量（如果後端不在 Vercel）

如果您的後端部署在其他平台（如 Railway、Render），需要設置：

- **Name**: `VITE_API_URL`
- **Value**: 您的後端 URL（例如：`https://your-backend.railway.app`）

⚠️ **注意**: URL 不要包含尾隨斜杠 `/`

### 4. 部署

點擊 "Deploy" 按鈕，等待構建完成。

## 🔍 驗證部署

部署完成後，檢查：

1. **首頁是否正常顯示**
   - 訪問您的 Vercel URL
   - 應該能看到首頁內容

2. **路由是否正常工作**
   - 嘗試訪問 `/products`
   - 嘗試訪問 `/login`
   - 如果這些路由返回 404，檢查 `vercel.json` 是否正確

3. **API 請求是否正常**
   - 打開瀏覽器開發者工具
   - 檢查 Network 標籤
   - 查看 API 請求是否成功

## ❌ 常見問題排查

### 問題 1: 所有路由都返回 404

**解決方案**:
- 確認 `client/vercel.json` 文件存在
- 確認 Root Directory 設置為 `client`
- 重新部署項目

### 問題 2: API 請求失敗 (CORS 或 404)

**解決方案**:
- 確認已設置環境變量 `VITE_API_URL`
- 確認後端服務器正在運行
- 檢查後端的 CORS 配置是否允許 Vercel 域名

### 問題 3: 構建失敗

**解決方案**:
- 檢查構建日誌中的錯誤信息
- 確認所有依賴都已安裝
- 確認 TypeScript 沒有錯誤

### 問題 4: 靜態資源 404

**解決方案**:
- 確認 `dist` 目錄包含所有構建文件
- 檢查 `index.html` 中的資源路徑是否正確

## 📝 重要提示

1. **Root Directory 必須設置為 `client`**，否則 Vercel 無法找到正確的構建配置

2. **環境變量必須以 `VITE_` 開頭**，這樣 Vite 才會在構建時包含它們

3. **每次修改環境變量後需要重新部署**

4. **如果後端也在 Vercel 上**，可以通過 rewrites 來代理 API 請求，不需要設置 `VITE_API_URL`

## 🚀 快速測試

部署後，訪問以下 URL 測試：
- `https://your-app.vercel.app/` - 首頁
- `https://your-app.vercel.app/products` - 商品頁
- `https://your-app.vercel.app/login` - 登錄頁

如果這些都能正常訪問，說明部署成功！
