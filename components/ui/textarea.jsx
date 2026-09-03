'use client';

import React, { useEffect, useState } from 'react';
import { Error } from '@/components/ui/error';

function clsx(...args) {
  return args
    .flatMap((a) => {
      if (!a) return [];
      if (typeof a === 'string') return [a];
      if (Array.isArray(a)) return a;
      if (typeof a === 'object') return Object.keys(a).filter((k) => a[k]);
      return [];
    })
    .join(' ');
}

/** Plain multi-line input (not rich text — use SimpleEditor for that). */
export function Textarea({
  defaultValue,
  placeholder = '',
  disabled,
  error,
  size = 'mediumSmall',
  style,
  value,
  onChange,
  className,
  ref,
  id,
  name,
  rows,
  dir,
  maxLength,
  required,
  autoComplete = 'off',
  ...rest
}) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState(value ?? defaultValue ?? '');
  // از rest حذف شود تا روی textarea هم value و هم defaultValue نرود
  const { defaultValue: _dv, value: _v, onChange: _oc, ...safeRest } = rest;

  useEffect(() => {
    if (isControlled) setInner(value ?? '');
  }, [value, isControlled]);

  const handleChange = (e) => {
    const next = e.target.value;
    if (!isControlled) setInner(next);
    if (onChange) onChange(next);
  };

  const fallbackMin =
    size === 'xSmall' ? 64 : size === 'small' ? 80 : size === 'large' ? 120 : 100;

  return (
    <div className="w-full flex flex-col gap-2">
      <textarea
        id={id}
        name={name}
        rows={rows}
        dir={dir}
        maxLength={maxLength}
        required={required}
        className={clsx(
          'ui-textarea rounded-xl resize-none bg-background-100 text-geist-foreground placeholder:text-gray-900 outline-none w-full duration-150 border border-gray-alpha-400 hover:border-gray-alpha-500',
          size === 'large' ? 'min-h-12 py-2.5 px-3 text-base' : 'min-h-10 p-2.5 text-sm',
          disabled && 'bg-gray-100 text-gray-700 placeholder:text-gray-700 placeholder:opacity-50 cursor-not-allowed',
          error ? 'border-red-500 text-error shadow-none ring-0' : 'focus:border-[#4CCD99] focus:shadow-none focus:ring-0',
          'dark:bg-primary-950 dark:text-white dark:placeholder:text-white/40 dark:border-white/20 dark:hover:border-white/35',
          className
        )}
        placeholder={placeholder || ''}
        disabled={disabled}
        style={{ minHeight: style?.minHeight ?? (rows ? undefined : fallbackMin), ...style }}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        ref={ref}
        {...safeRest}
        value={isControlled ? (value ?? '') : inner}
        onChange={handleChange}
      />
      {error ? <Error size={size === 'large' ? 'large' : 'small'}>{error}</Error> : null}
    </div>
  );
}

export default Textarea;
