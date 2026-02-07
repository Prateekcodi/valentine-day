'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  type = 'button',
}: GlassButtonProps) {
  const baseClasses = `
    relative overflow-hidden
    rounded-full
    font-medium
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:pointer-events-none
    ${loading ? 'pointer-events-none' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-white/30 backdrop-blur-md
      border border-white/40
      text-gray-900
      hover:bg-white/40 hover:scale-105
      active:scale-95
      shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]
      hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.2)]
    `,
    secondary: `
      bg-white/10 backdrop-blur-md
      border border-white/20
      text-gray-700
      hover:bg-white/20 hover:border-white/30
      active:scale-95
    `,
    ghost: `
      bg-transparent
      border border-white/10
      text-gray-600
      hover:bg-white/10 hover:border-white/20
      active:scale-95
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100" />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
}
