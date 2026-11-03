import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import lottieUrl from '@/assets/animated/logo-packed-animada.lottie?url';
import animSvgUrl from '@/assets/animated/logo-packed-animada.svg';

interface LottieLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  message,
  size = 'md',
  className = '',
  fullScreen = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
    xl: 'w-64 h-64',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {!hasError ? (
          <DotLottieReact
            src={lottieUrl}
            loop
            autoplay
            onError={() => setHasError(true)}
            className="w-full h-full"
          />
        ) : (
          <img
            src={animSvgUrl}
            alt="Carregando..."
            className="w-full h-full object-contain"
          />
        )}
      </div>
      {message && (
        <p className="mt-3 text-sm md:text-base font-medium text-[#0B2B33]/80 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F3F7F6]/90 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};
