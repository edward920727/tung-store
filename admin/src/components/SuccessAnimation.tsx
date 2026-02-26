import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const SuccessAnimation = ({ show, onComplete }: SuccessAnimationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100 animate-bounceIn">
        <div className="flex flex-col items-center">
          {/* 成功勾勾動畫 */}
          <div className="relative w-20 h-20 mb-4">
            <svg
              className="w-20 h-20 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* 圓圈動畫 */}
              <circle
                cx="12"
                cy="12"
                r="10"
                strokeWidth="2"
                strokeDasharray="62.83"
                strokeDashoffset={isAnimating ? '0' : '62.83'}
                className="transition-all duration-600 ease-out"
                style={{
                  transition: 'stroke-dashoffset 0.6s ease-out',
                }}
              />
              {/* 勾勾動畫 */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
                strokeDasharray="20"
                strokeDashoffset={isAnimating ? '0' : '20'}
                className="transition-all duration-300 ease-out"
                style={{
                  transition: 'stroke-dashoffset 0.3s ease-out 0.5s',
                  opacity: isAnimating ? 1 : 0,
                }}
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 animate-fadeIn">保存成功！</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
