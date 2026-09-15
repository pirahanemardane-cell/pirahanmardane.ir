'use client';

import { LumaSpinBlock } from '@/components/ui/luma-spin';

export default function PageBootShell({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" role="status" aria-live="polite">
      <LumaSpinBlock label={label} />
    </div>
  );
}
