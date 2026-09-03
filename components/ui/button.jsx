'use client';

import * as React from 'react';

function cx(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ');
}

const variants = {
  default: 'bg-primary-900 text-white hover:opacity-90 dark:bg-white dark:text-black',
  outline: 'border border-primary-300 dark:border-white/25 bg-transparent hover:bg-primary-50 dark:hover:bg-white/10',
  ghost: 'hover:bg-primary-100 dark:hover:bg-white/10',
};

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', size = 'default', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  );
});

export default Button;
