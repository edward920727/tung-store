import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=400&q=80',
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 當 src 改變時重置狀態
    if (imageSrc !== src) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, imageSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // 確保圖片已經完全加載
    const img = e.currentTarget;
    if (img.complete && img.naturalHeight !== 0) {
      setIsLoading(false);
      onLoad?.();
    }
  };

  const handleError = () => {
    setIsLoading(false);
    if (imageSrc !== fallbackSrc) {
      // 嘗試使用回退圖片
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      // 如果回退圖片也失敗了
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  // 檢查圖片是否已經加載完成（用於緩存中的圖片）
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
      setIsLoading(false);
    }
  }, [imageSrc]);

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* 專業的骨架屏 - 閃動效果 */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
        </div>
      )}
      {hasError ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-xs">圖片加載失敗</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          decoding="async"
          {...(loading === 'eager' ? { fetchpriority: 'high' as const } : {})}
        />
      )}
    </div>
  );
};
