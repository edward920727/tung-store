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
    
    const { verified, expiresAt } = JSON.parse(authData);
    if (!verified) {
      return false;
    }
    
    // 检查是否过期
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem('headquarters_auth');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('检查总部验证状态失败:', error);
    return false;
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
