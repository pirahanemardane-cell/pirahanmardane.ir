'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';

export default function AuthModalView() {
  const { authOpen, closeAuth, authMode } = useAppApi();
  if (!authOpen) return null;
  return <LoginCardSection mode={authMode === 'seller' ? 'seller' : 'buyer'} onClose={closeAuth} />;
}
