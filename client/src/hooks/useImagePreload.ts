import { useEffect, useState } from 'react';

/**
 * 預加載圖片的 Hook
 * @param imageUrls 要預加載的圖片 URL 數組
 * @returns 預加載狀態
 */
export const useImagePreload = (imageUrls: string[]): { loaded: number; total: number; isComplete: boolean } => {
  const [loaded, setLoaded] = useState(0);
  const [total] = useState(imageUrls.length);

  useEffect(() => {
    if (imageUrls.length === 0) return;

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    const loadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoaded(loadedCount);
          resolve();
        };
        img.onerror = () => {
          // 即使失敗也計入，避免阻塞
          loadedCount++;
          setLoaded(loadedCount);
          resolve();
        };
        img.src = url;
        images.push(img);
      });
    };

    // 並行加載所有圖片
    Promise.all(imageUrls.map(loadImage)).catch((error) => {
      console.warn('圖片預加載過程中出現錯誤:', error);
    });

    // 清理函數
    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);

  return {
    loaded,
    total,
    isComplete: loaded === total && total > 0,
  };
};
