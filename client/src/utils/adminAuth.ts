/**
 * 总部验证工具
 * 用于验证来自 edward727.com 的管理员访问权限
 */

// 总部验证密钥（应该从环境变量或配置中获取，这里使用预设值）
// 在实际部署时，应该从环境变量或安全的配置服务中获取
// 注意：在 Vite/前端环境中不能使用 process.env，这里改用 import.meta.env
const HEADQUARTERS_SECRET =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_HEADQUARTERS_SECRET) ||
  'edward727-admin-secret-2024';

/**
 * 验证总部 token
 * @param token - 从 URL 参数中获取的 token
 * @returns 是否验证通过
 */
export const verifyHeadquartersToken = async (token: string): Promise<boolean> => {
  if (!token) {
    return false;
  }

  // 确保在浏览器环境中运行
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return false;
  }

  try {
    // 方法 1: 直接验证 token（简单验证）
    // 在实际应用中，应该调用 edward727.com 的 API 来验证 token
    // 这里先实现一个简单的验证逻辑
    
    // 检查 token 格式和有效性
    // 实际应该调用: await fetch('https://edward727.com/api/verify-admin-token', { ... })
    
    // 临时实现：检查 token 是否匹配预设的密钥
    // 在生产环境中，应该通过 HTTPS 调用 edward727.com 的验证 API
    const isValid = token === HEADQUARTERS_SECRET;
    
    if (isValid) {
      // 将验证状态存储到 sessionStorage，有效期 1 小时
      sessionStorage.setItem('headquarters_auth', JSON.stringify({
        verified: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000 // 1 小时后过期
      }));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('验证总部 token 失败:', error);
    return false;
  }
};

/**
 * 检查是否已通过总部验证
 * @returns 是否已验证且未过期
 */
export const isHeadquartersVerified = (): boolean => {
  // 确保在浏览器环境中运行
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return false;
  }
  
  try {
    const authData = sessionStorage.getItem('headquarters_auth');
    if (!authData) {
      return false;
    }
    
    const parsed = JSON.parse(authData);
    const { verified, expiresAt } = parsed;
    
    if (!verified) {
      return false;
    }
    
    // 检查是否过期
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem('headquarters_auth');
      return false;
    }
    
    // 如果有 user 資訊，表示是透過 verify-token API 驗證的
    // 如果沒有 user 資訊，表示是透過原本的總部 token 驗證的
    return true;
  } catch (error) {
    console.error('检查总部验证状态失败:', error);
    return false;
  }
};

/**
 * 取得總部驗證的使用者資訊（如果有的話）
 * @returns 使用者資訊或 null
 */
export const getHeadquartersUser = (): any | null => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null;
  }
  
  try {
    const authData = sessionStorage.getItem('headquarters_auth');
    if (!authData) {
      return null;
    }
    
    const parsed = JSON.parse(authData);
    return parsed.user || null;
  } catch (error) {
    console.error('取得總部驗證使用者資訊失敗:', error);
    return null;
  }
};

/**
 * 清除总部验证状态
 */
export const clearHeadquartersAuth = (): void => {
  sessionStorage.removeItem('headquarters_auth');
};

/**
 * 从 URL 参数中提取并验证总部 token
 * @returns 是否验证成功
 */
export const processHeadquartersToken = async (): Promise<boolean> => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('admin_token') || urlParams.get('token');
  
  if (token) {
    const verified = await verifyHeadquartersToken(token);
    if (verified) {
      // 清除 URL 中的 token 参数（保护隐私）
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('admin_token');
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.toString());
      return true;
    }
  }
  
  return false;
};

/**
 * 使用 URL 中的 authToken 參數自動登入（透過後端 API 驗證 ID Token）
 * 
 * 用法：總部在打開後台時，帶上 ?authToken=xxx 參數（base64 編碼的 JSON），
 * 頁面載入後會自動解析 token 並發送到後端 API 驗證，驗證成功後建立 session。
 * 
 * authToken 格式：base64 編碼的 JSON，例如：
 * { "token": "Firebase ID Token" }
 */
export const processAuthTokenLogin = async (): Promise<boolean> => {
  // 僅在瀏覽器環境中執行
  if (typeof window === 'undefined') {
    return false;
  }

  const urlParams = new URLSearchParams(window.location.search);
  // 支援兩種寫法：authToken 或 auth_token
  const authToken = urlParams.get('authToken') || urlParams.get('auth_token');

  if (!authToken) {
    return false;
  }

  try {
    // 1. 從 URL 取得並解析 authToken（base64 解碼）
    let tokenData: { token: string };
    try {
      const decoded = atob(authToken);
      tokenData = JSON.parse(decoded);
      
      if (!tokenData.token) {
        console.error('authToken 解析後沒有 token 欄位');
        return false;
      }
    } catch (error) {
      console.error('解析 authToken 失敗（可能不是 base64 編碼的 JSON）:', error);
      return false;
    }

    // 2. 發送到後端 API 驗證（不要用 signInWithCustomToken！）
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenData.token })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '驗證失敗' }));
      console.error('後端驗證 token 失敗:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('後端驗證 token 成功:', result);

    // 3. 驗證成功後建立 session 或儲存使用者資訊
    if (result.user) {
      // 將使用者資訊儲存到 sessionStorage
      sessionStorage.setItem('headquarters_auth', JSON.stringify({
        verified: true,
        user: result.user,
        timestamp: Date.now(),
        expiresAt: Date.now() + (result.expiresIn || 3600) * 1000 // 預設 1 小時
      }));
    }

    // 為了安全，登入成功後把 URL 上的 authToken 移除
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('authToken');
    newUrl.searchParams.delete('auth_token');
    window.history.replaceState({}, '', newUrl.toString());

    return true;
  } catch (error: any) {
    console.error('使用 authToken 自動登入失敗:', error);
    return false;
  }
};
