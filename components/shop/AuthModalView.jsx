'use client';

import { useAppApi } from '../AppApiContext';
import LoginCardSection from '@/components/ui/login-signup';
import { patchModalUi } from '@/lib/stores/modalUiStore';

function isAdminLoginPath() {
  // مسیر عمومی ادمین حذف شد — فقط از prop mode استفاده شود
  return false;
}

export default function AuthModalView() {
  const api = useAppApi() || {};
  const forcePath = isAdminLoginPath();
  if (!api.authOpen && !forcePath) return null;

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

  const forceAdmin = forcePath || api.authMode === 'admin';
  const mode = forceAdmin ? 'admin' : api.authMode === 'seller' ? 'seller' : 'buyer';

  return (
    <LoginCardSection
      mode={mode}
      onClose={handleClose}
      onContact={handleContact}
    />
  );
}
