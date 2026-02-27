# Firebase Admin SDK 設定說明

## 概述

後端 API `/api/verify-token` 使用 Firebase Admin SDK 來驗證總部傳來的 Firebase ID Token。

## 安裝依賴

後端已經在 `package.json` 中加入 `firebase-admin`，請執行：

```bash
cd server
npm install
```

## 設定 Firebase Admin SDK

### 方法 1: 使用環境變數（推薦）

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `tung-315`
3. 進入 **專案設定** > **服務帳號**
4. 點擊「產生新的私密金鑰」
5. 下載 JSON 檔案
6. 將 JSON 檔案的內容設定為環境變數 `FIREBASE_SERVICE_ACCOUNT`

在 `server/.env` 檔案中：

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"tung-315",...}'
```

**注意**：JSON 內容需要用單引號包起來，並且整個 JSON 要在一行內。

### 方法 2: 使用檔案路徑

1. 將下載的服務帳號 JSON 檔案放在 `server/` 目錄下（例如：`server/firebase-service-account.json`）
2. 在 `server/.env` 檔案中設定：

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 方法 3: 使用應用程式預設憑證（適用於 GCP 環境）

如果部署在 Google Cloud Platform 上，可以使用應用程式預設憑證：

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
```

## 驗證設定

啟動後端伺服器後，應該會看到：

```
✅ Firebase Admin SDK 初始化成功
```

如果看到錯誤訊息，請檢查環境變數設定。

## API 使用方式

### 前端

前端會在後台路由載入時自動處理 `authToken` 參數：

1. 從 URL 取得 `authToken`（base64 編碼的 JSON）
2. 解析 base64 得到 `{ token: "Firebase ID Token" }`
3. 發送 POST 請求到 `/api/verify-token` 驗證
4. 驗證成功後儲存使用者資訊到 sessionStorage

### 後端 API

**Endpoint**: `POST /api/verify-token`

**請求體**:
```json
{
  "token": "Firebase ID Token"
}
```

**成功回應**:
```json
{
  "success": true,
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "emailVerified": true,
    "displayName": "User Name",
    "photoURL": "https://...",
    "customClaims": { ... }
  },
  "expiresIn": 3600
}
```

**錯誤回應**:
```json
{
  "error": "錯誤訊息"
}
```

## 安全注意事項

1. **不要將服務帳號 JSON 檔案提交到 Git**
   - 將 `firebase-service-account.json` 加入 `.gitignore`
   - 使用環境變數或安全的配置管理服務

2. **生產環境設定**
   - 使用環境變數或密鑰管理服務（如 AWS Secrets Manager、Google Secret Manager）
   - 不要將憑證硬編碼在程式碼中

3. **Token 驗證**
   - 後端會驗證 token 的有效性和過期時間
   - 過期的 token 會被拒絕

## 故障排除

### Firebase Admin SDK 初始化失敗

**錯誤**: `❌ Firebase Admin SDK 初始化失敗`

**解決方法**:
1. 檢查環境變數是否正確設定
2. 確認服務帳號 JSON 格式正確
3. 確認服務帳號有足夠的權限

### Token 驗證失敗

**錯誤**: `Token 驗證失敗`

**可能原因**:
1. Token 已過期
2. Token 格式不正確
3. Token 已被撤銷
4. 服務帳號權限不足

**解決方法**:
1. 檢查 token 是否有效
2. 確認 Firebase 專案設定正確
3. 檢查服務帳號權限
