'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children?: ReactNode;
  variant?: 'subtle' | 'medium' | 'strong';
  colored?: boolean;
  dayTheme?: number;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  variant = 'medium',
  colored = false,
  dayTheme,
  className,
  hover = false,
  onClick,
}: GlassCardProps) {
  const baseClasses = `
    relative
    rounded-2xl
    border border-white/20
    transition-all duration-500
    ${hover ? 'cursor-pointer hover:bg-white/30 hover:scale-[1.02] hover:shadow-[0_16px_64px_0_rgba(0,0,0,0.25)]' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const variantClasses = {
    subtle: 'bg-white/10 backdrop-blur-[10px]',
    medium: 'bg-white/25 backdrop-blur-[20px] backdrop-saturate-[180%]',
    strong: 'bg-white/40 backdrop-blur-[30px] backdrop-saturate-[200%]',
  };

  const shadowClasses = {
    subtle: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
    medium: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]',
    strong: 'shadow-[0_12px_48px_0_rgba(0,0,0,0.2)]',
  };

  const dayColors: Record<number, string> = {
    1: 'rgba(255, 107, 157, 0.15)',
    2: 'rgba(255, 140, 105, 0.15)',
    3: 'rgba(139, 69, 19, 0.15)',
    4: 'rgba(255, 180, 162, 0.15)',
    5: 'rgba(212, 175, 55, 0.15)',
    6: 'rgba(255, 23, 68, 0.15)',
    7: 'rgba(255, 140, 105, 0.15)',
    8: 'rgba(245, 0, 87, 0.15)',
  };

  const style = colored && dayTheme ? {
    background: `linear-gradient(135deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      ${dayColors[dayTheme] || 'rgba(255, 255, 255, 0.15)'} 100%)`,
  } : {};

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], shadowClasses[variant], className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
