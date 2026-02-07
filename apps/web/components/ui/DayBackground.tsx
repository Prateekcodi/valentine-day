'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DayBackgroundProps {
  children?: ReactNode;
  day: number;
  className?: string;
}

const gradientClasses: Record<number, string> = {
  1: 'from-rose-100 via-pink-50 to-rose-50',
  2: 'from-orange-50 via-amber-50 to-orange-100',
  3: 'from-amber-100 via-yellow-50 to-amber-50',
  4: 'from-pink-50 via-rose-50 to-pink-100',
  5: 'from-yellow-50 via-amber-50 to-yellow-100',
  6: 'from-red-100 via-pink-100 to-rose-100',
  7: 'from-orange-100 via-pink-100 to-rose-100',
  8: 'from-rose-200 via-pink-200 to-red-200',
};

export function DayBackground({ children, day, className }: DayBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[day] || gradientClasses[1]}`} />
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,157,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,140,105,0.3),transparent_50%)]" />
      </div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
