import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 啟用壓縮
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生產環境移除 console
        drop_debugger: true,
      },
    },
    // 優化 chunk 大小
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React 相關
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // Firebase 相關
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          // UI 庫
          if (id.includes('@dnd-kit')) {
            return 'ui-vendor';
          }
          // 圖片處理
          if (id.includes('react-image-crop')) {
            return 'image-vendor';
          }
        },
        // 優化文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // 啟用源映射（僅開發環境）
    sourcemap: process.env.NODE_ENV === 'development',
    // 優化構建性能
    target: 'es2015',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // 預構建優化
    esbuildOptions: {
      target: 'es2015',
    },
  },
  // 預加載優化
  preview: {
    port: 4173,
    strictPort: true,
  },
})
