import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import lottieDarkBgUrl from '@/assets/animated/logo-packed-animada.lottie?url';
import animDarkBgSvgUrl from '@/assets/animated/logo-packed-animada.svg';
import lottieLightBgUrl from '@/assets/animated/logo-packed-animada-white.lottie?url';
import animLightBgSvgUrl from '@/assets/animated/logo-packed-animada-white.svg';

interface LottieLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light-bg' | 'dark-bg';
  className?: string;
  fullScreen?: boolean;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  message,
  size = 'md',
  variant = 'light-bg',
  className = '',
  fullScreen = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
    xl: 'w-60 h-60',
  };

  const activeLottieUrl = variant === 'dark-bg' ? lottieDarkBgUrl : lottieLightBgUrl;
  const activeSvgUrl = variant === 'dark-bg' ? animDarkBgSvgUrl : animLightBgSvgUrl;

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {!hasError ? (
          <DotLottieReact
            src={activeLottieUrl}
            loop
            autoplay
            speed={1.5}
            onError={() => setHasError(true)}
            className="w-full h-full"
          />
        ) : (
          <img
            src={activeSvgUrl}
            alt="Carregando..."
            className="w-full h-full object-contain"
          />
        )}
      </div>
      {message && (
        <p
          className={`mt-2 text-sm md:text-base font-semibold tracking-tight animate-pulse ${
            variant === 'dark-bg' ? 'text-white/90' : 'text-[#0B2B33]'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${
          variant === 'dark-bg' ? 'bg-[#0B2B33]/95' : 'bg-[#F3F7F6]/90'
        }`}
      >
        {content}
      </div>
    );
  }

  return content;
};
