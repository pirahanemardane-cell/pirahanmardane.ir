'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';

export default function AuthModalView() {
  const api = useAppApi() || {};
  const { authOpen, closeAuth, authMode, openStaticPage, setAuthOpen } = api;

  if (!authOpen) return null;

  const handleClose = () => {
    try {
      if (typeof closeAuth === 'function') closeAuth();
      else if (typeof setAuthOpen === 'function') setAuthOpen(false);
    } catch (_) {
      try {
        if (typeof setAuthOpen === 'function') setAuthOpen(false);
      } catch (__) {}
    }
  };

  const handleContact = () => {
    try {
      handleClose();
    } catch (_) {}
    try {
      if (typeof openStaticPage === 'function') openStaticPage('contact');
      else window.location.assign('/تماس-با-ما');
    } catch (_) {
      try {
        window.location.assign('/تماس-با-ما');
      } catch (__) {}
    }
  };

  return (
    <LoginCardSection
      mode={authMode === 'seller' ? 'seller' : 'buyer'}
      onClose={handleClose}
      onContact={handleContact}
    />
  );
}
