import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// 初始化 Firebase Admin SDK（如果還沒初始化）
if (!admin.apps.length) {
  try {
    // 方法 1: 使用環境變數中的服務帳號 JSON（推薦）
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } 
    // 方法 2: 使用服務帳號檔案路徑
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    // 方法 3: 使用預設的應用程式預設憑證（適用於 GCP 環境）
    else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    console.log('✅ Firebase Admin SDK 初始化成功');
  } catch (error) {
    console.error('❌ Firebase Admin SDK 初始化失敗:', error);
    console.warn('⚠️  請設定 FIREBASE_SERVICE_ACCOUNT 環境變數或 FIREBASE_SERVICE_ACCOUNT_PATH');
  }
}

/**
 * POST /api/verify-token
 * 驗證 Firebase ID Token
 * 
 * 請求體：
 * {
 *   "token": "Firebase ID Token"
 * }
 * 
 * 回應：
 * {
 *   "success": true,
 *   "user": {
 *     "uid": "user-id",
 *     "email": "user@example.com",
 *     ...
 *   },
 *   "expiresIn": 3600
 * }
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: '請提供 token' });
    }

    // 使用 Firebase Admin SDK 驗證 ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error: any) {
      console.error('驗證 ID Token 失敗:', error);
      
      // 提供更詳細的錯誤訊息
      if (error.code === 'auth/argument-error') {
        return res.status(400).json({ error: 'Token 格式無效' });
      } else if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Token 已過期' });
      } else if (error.code === 'auth/id-token-revoked') {
        return res.status(401).json({ error: 'Token 已被撤銷' });
      } else {
        return res.status(401).json({ error: 'Token 驗證失敗', details: error.message });
      }
    }

    // 驗證成功，取得使用者資訊
    const user = await admin.auth().getUser(decodedToken.uid);
    
    // 計算 token 過期時間（秒）
    const expiresIn = decodedToken.exp ? decodedToken.exp - Math.floor(Date.now() / 1000) : 3600;

    // 回傳使用者資訊
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        customClaims: decodedToken,
      },
      expiresIn: expiresIn > 0 ? expiresIn : 3600
    });
  } catch (error: any) {
    console.error('驗證 token 時發生錯誤:', error);
    res.status(500).json({ 
      error: '伺服器錯誤', 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export default router;
