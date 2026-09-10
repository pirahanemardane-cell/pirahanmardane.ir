'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';
import { patchModalUi } from '@/lib/stores/modalUiStore';

function isAdminLoginPath() {
  try {
    const p = String(typeof window !== 'undefined' ? window.location.pathname || '' : '');
    return p === '/amirpnl' || p.endsWith('/amirpnl');
  } catch (_) {
    return false;
  }
}

export default function AuthModalView() {
  const api = useAppApi() || {};
  if (!api.authOpen) return null;

  const handleClose = () => {
    try { patchModalUi({ authOpen: false }); } catch (_) {}
    try { api.closeAuth?.(); } catch (_) {}
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

  const forceAdmin = isAdminLoginPath() || api.authMode === 'admin';
  const mode = forceAdmin ? 'admin' : api.authMode === 'seller' ? 'seller' : 'buyer';

  return (
    <LoginCardSection
      mode={mode}
      onClose={handleClose}
      onContact={handleContact}
    />
  );
}
