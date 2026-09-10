'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';
import { patchModalUi } from '@/lib/stores/modalUiStore';

export default function AuthModalView() {
  const api = useAppApi() || {};
  if (!api.authOpen) return null;

  const handleClose = () => {
    try { api.closeAuth?.(); } catch (_) {}
    try { patchModalUi({ authOpen: false }); } catch (_) {}
    try { api.setAuthOpen?.(false); } catch (_) {}
  };

  const handleContact = () => {
    handleClose();
    try {
      if (typeof api.openStaticPage === 'function') {
        api.openStaticPage('contact');
        return;
      }
    } catch (_) {}
    try { window.location.assign('/تماس-با-ما'); } catch (_) {}
  };

  return (
    <LoginCardSection
      mode={api.authMode === 'seller' ? 'seller' : 'buyer'}
      onClose={handleClose}
      onContact={handleContact}
    />
  );
}
