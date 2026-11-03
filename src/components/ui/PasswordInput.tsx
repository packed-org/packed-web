import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || props.name || 'password-input';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#0B2B33] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...props}
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-11 text-sm text-[#0B2B33] placeholder:text-gray-400 focus:border-[#0B7A75] focus:outline-none focus:ring-2 focus:ring-[#0B7A75]/20 transition-all ${
              error ? 'border-[#C93E22] focus:border-[#C93E22] focus:ring-[#C93E22]/20' : ''
            } ${className}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B2B33] focus:outline-none cursor-pointer transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-[#C93E22]">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

