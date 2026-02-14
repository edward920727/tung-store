# 修復 ERR_NAME_NOT_RESOLVED 錯誤

## 問題說明

`ERR_NAME_NOT_RESOLVED` 錯誤表示無法解析域名，通常發生在嘗試連接到不存在的服務器時。

## 已修復的問題

### 1. API 配置改進 ✅

已更新 `client/src/config/api.ts`：
- 添加了 URL 驗證
- 添加了錯誤攔截器
- 改進了錯誤處理
- 添加了超時設置

### 2. 錯誤處理

現在如果 API 配置無效，會：
- 顯示警告而不是錯誤
- 不會嘗試連接無效的 URL
- 提供清晰的錯誤信息

## 排查步驟

### 步驟 1: 檢查錯誤來源

1. 打開瀏覽器開發者工具（F12）
2. 切換到 **Network** 標籤
3. 找到標記為 **Failed** 的請求
4. 查看請求的 URL

### 步驟 2: 常見錯誤來源

#### A. Firebase 連接問題

如果錯誤來自 Firebase：
- 檢查 `client/src/config/firebase.ts` 配置
- 確認 Firebase 項目狀態
- 檢查網絡連接

#### B. 圖片加載問題

如果錯誤來自圖片 URL：
- 檢查圖片 URL 是否有效
- 確認 Unsplash 圖片鏈接是否正確
- 嘗試使用其他圖片 URL

#### C. API 請求問題（如果使用）

如果錯誤來自 API 請求：
- 檢查 `VITE_API_URL` 環境變量
- 確認後端服務器是否運行
- 檢查 Vite proxy 配置

### 步驟 3: 驗證修復

1. **清除瀏覽器緩存**
   - 按 `Ctrl + Shift + Delete` (Windows) 或 `Cmd + Shift + Delete` (Mac)
   - 清除緩存和 Cookie

2. **重新加載頁面**
   - 按 `Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac) 強制刷新

3. **檢查控制台**
   - 查看是否還有錯誤
   - 確認錯誤是否已解決

## 當前項目架構

**重要**：此項目主要使用 **Firebase**，不需要傳統的後端 API。

- ✅ **數據存儲**：Firebase Firestore
- ✅ **用戶認證**：Firebase Authentication  
- ✅ **文件存儲**：Firebase Storage
- ❌ **不需要**：傳統的後端 API 服務器

## 如果錯誤仍然存在

請提供以下信息：

1. **錯誤詳情**：
   - 完整的錯誤信息
   - 錯誤發生的頁面
   - 錯誤發生的時間（頁面加載時？點擊按鈕時？）

2. **Network 標籤信息**：
   - 失敗請求的 URL
   - 請求方法（GET/POST 等）
   - 狀態碼

3. **瀏覽器信息**：
   - 瀏覽器類型（Chrome/Firefox/Safari 等）
   - 瀏覽器版本

4. **環境信息**：
   - 本地開發還是生產環境？
   - 如果是生產環境，部署在哪裡？（Vercel 等）

## 臨時解決方案

如果錯誤不影響主要功能：

1. **忽略警告**：如果只是警告而不是錯誤，可以暫時忽略
2. **檢查功能**：確認網站的主要功能是否正常
3. **監控錯誤**：觀察錯誤是否持續出現

## 相關文件

- `client/src/config/api.ts` - API 配置（已修復）
- `client/src/config/firebase.ts` - Firebase 配置
- `NETWORK_ERROR_TROUBLESHOOTING.md` - 詳細排查指南
