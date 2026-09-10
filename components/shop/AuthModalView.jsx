'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';
import { patchModalUi } from '@/lib/stores/modalUiStore';

export default function AuthModalView() {
  const api = useAppApi() || {};
  const authOpen = api.authOpen;
  const authMode = api.authMode;

  if (!authOpen) return null;

  const handleClose = () => {
    try {
      if (typeof api.closeAuth === 'function') api.closeAuth();
    } catch (_) {}
    try {
      patchModalUi({ authOpen: false });
    } catch (_) {}
    try {
      if (typeof api.setAuthOpen === 'function') api.setAuthOpen(false);
    } catch (_) {}
  };

  const handleContact = () => {
    handleClose();
    try {
      if (typeof api.openStaticPage === 'function') {
        api.openStaticPage('contact');
        return;
      }
    } catch (_) {}
    try {
      window.location.assign('/تماس-با-ما');
    } catch (_) {}
  };

  return (
    <LoginCardSection
      mode={authMode === 'seller' ? 'seller' : 'buyer'}
      onClose={handleClose}
      onContact={handleContact}
    />
  );
}
