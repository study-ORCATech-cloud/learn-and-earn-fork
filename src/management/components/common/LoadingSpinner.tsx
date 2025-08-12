// Loading spinner component for management interface

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'slate';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'border-blue-400 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-400 border-t-transparent',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'border-2 rounded-full animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <span className={cn('text-slate-300', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;