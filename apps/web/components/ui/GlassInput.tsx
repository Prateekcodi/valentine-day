'use client';

import { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  type?: 'text' | 'password' | 'email' | 'number';
  className?: string;
  error?: boolean;
}

export function GlassInput({
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
  rows = 3,
  disabled = false,
  type = 'text',
  className,
  error = false,
}: GlassInputProps) {
  const baseClasses = `
    w-full px-4 py-3
    bg-white/20 backdrop-blur-md
    border rounded-2xl
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-white/50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error
      ? 'border-red-400/50 focus:border-red-400/60 focus:bg-red-50/30'
      : 'border-white/30 focus:bg-white/30 focus:border-white/40'
    }
  `;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    onChange(newValue);
  };

  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <Component
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(baseClasses, className)}
      />
      {maxLength && (
        <div className="absolute bottom-2 right-3 text-xs text-gray-500">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
