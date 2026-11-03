import React from 'react';
import horizontalLogoUrl from '@/assets/logo-packed-horizontal.svg';

interface PackedLogoProps {
  variant?: 'horizontal' | 'header' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PackedLogo: React.FC<PackedLogoProps> = ({
  variant = 'header',
  className = '',
  size = 'md',
}) => {
  if (variant === 'horizontal') {
    return (
      <img
        src={horizontalLogoUrl}
        alt="Packed Logo"
        className={`h-9 w-auto object-contain ${className}`}
      />
    );
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const SuitcaseIcon = (
    <div
      className={`${iconSizes[size]} rounded-lg bg-[#0B7A75] flex items-center justify-center text-white shadow-sm shrink-0`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4/6 h-4/6"
      >
        <rect width="18" height="14" x="3" y="7" rx="3" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={className}>{SuitcaseIcon}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {SuitcaseIcon}
      <span className={`font-heading font-extrabold tracking-tight text-[#0B2B33] ${textSizes[size]}`}>
        packed
      </span>
    </div>
  );
};
