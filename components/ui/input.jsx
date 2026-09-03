'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-primary-200 dark:border-white/20',
        'bg-white dark:bg-[#212121] px-3 py-2.5 text-sm text-primary-900 dark:text-white',
        'placeholder:text-primary-400 dark:placeholder:text-white/40',
        'shadow-none outline-none transition-colors',
        'focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none focus-visible:border-[#4CCD99]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
