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
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      {hasError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center min-h-[256px]">
          <span className="text-gray-400 text-sm">圖片加載失敗</span>
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
