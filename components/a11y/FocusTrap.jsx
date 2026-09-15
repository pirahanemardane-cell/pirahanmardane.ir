'use client';

import { useEffect, useRef } from 'react';
import { attachFocusTrap } from '@/lib/focus-trap';

/** Focus trap برای dialog/drawer — children را در یک ظرف با role مناسب می‌پیچد */
export default function FocusTrap({ active = true, role = 'dialog', label = '', className = '', children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    return attachFocusTrap(ref.current);
  }, [active]);

  return (
    <div
      ref={ref}
      role={role}
      aria-modal={active ? 'true' : undefined}
      aria-label={label || undefined}
      className={className}
    >
      {children}
    </div>
  );
}
