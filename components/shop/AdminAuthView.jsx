'use client';

import LoginCardSection from '@/components/ui/login-signup';

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
