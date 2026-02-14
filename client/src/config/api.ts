import axios from 'axios';

// API 配置
// 注意：此項目主要使用 Firebase，此 API 配置僅作為備用（如果將來需要）
const getApiBaseUrl = () => {
  // 在生產環境中，使用環境變量或默認值
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    // 確保 URL 有效
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return url;
    }
  }
  
  // 開發環境使用相對路徑（Vite proxy 會處理）
  if (import.meta.env.DEV) {
    return '/api'; // 使用相對路徑，由 Vite proxy 處理
  }
  
  // 生產環境：如果沒有設置環境變量，返回 null 以避免錯誤請求
  // 請在 Vercel 環境變量中設置 VITE_API_URL 為您的後端 URL（如果需要）
  // 例如：https://your-backend.railway.app 或 https://your-backend.render.com
  return null;
};

export const API_BASE_URL = getApiBaseUrl();

// 創建 axios 實例（僅在 API_BASE_URL 有效時）
// 注意：當前項目主要使用 Firebase，此 apiClient 可能未被使用
const apiClient = API_BASE_URL 
  ? axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10秒超時
    })
  : null;

// 添加請求攔截器以處理錯誤（僅在 apiClient 存在時）
if (apiClient) {
  apiClient.interceptors.request.use(
    (config) => {
      // 確保 baseURL 有效
      if (!config.baseURL || (!config.baseURL.startsWith('http') && !config.baseURL.startsWith('/'))) {
        console.warn('API baseURL 無效，跳過請求:', config.baseURL);
        return Promise.reject(new Error('Invalid API base URL'));
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // 處理網絡錯誤
      if (error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ENOTFOUND') {
        console.warn('API 服務器無法連接，請檢查網絡連接或 API 配置');
        console.warn('如果此項目使用 Firebase，此錯誤可以忽略');
      }
      return Promise.reject(error);
    }
  );
}

export default apiClient;
