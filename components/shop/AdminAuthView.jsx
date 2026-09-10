'use client';

import LoginCardSection from '@/components/ui/login-signup';

/** ورود ادمین — همان ظاهر و منطق لاگین خریدار/فروشنده */
export default function AdminAuthView({ open, onClose, onContact }) {
  if (!open) return null;
  return (
    <LoginCardSection
      mode="admin"
      onClose={onClose}
      onContact={onContact}
    />
  );
}
