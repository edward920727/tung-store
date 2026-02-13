import axios from 'axios';

// API 配置
const getApiBaseUrl = () => {
  // 在生產環境中，使用環境變量或默認值
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 開發環境使用相對路徑（Vite proxy 會處理）
  if (import.meta.env.DEV) {
    return '';
  }
  
  // 生產環境默認值（如果沒有設置環境變量）
  // 請在 Vercel 環境變量中設置 VITE_API_URL 為您的後端 URL
  // 例如：https://your-backend.railway.app 或 https://your-backend.render.com
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
