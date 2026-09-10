'use client';

import { useAppApi } from '../AppApiContext';

export default function AuthModalView() {
  const { Icon, authOpen, closeAuth, authMode } = useAppApi();
  if (!authOpen) return null;
  const isSeller = authMode === 'seller';

  return (
    <div className="site-modal-root" role="dialog" aria-modal="true" aria-label="ورود">
      <div className="site-modal-backdrop" onClick={closeAuth} />
      <div className="site-modal-panel bg-white dark:bg-primary-900 p-5 sm:p-6 border border-primary-200 dark:border-white/15 relative">
        <button
          type="button"
          onClick={closeAuth}
          className="absolute top-3 left-3 p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-800 text-primary-500"
          aria-label="بستن"
        >
          <Icon name="x" size={18} />
        </button>
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 dark:bg-white/10 text-primary-600 dark:text-white flex items-center justify-center">
            <Icon name="user" size={22} />
          </div>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white">
            {isSeller ? 'ورود فروشنده' : 'ورود'}
          </h3>
          <p className="text-sm text-primary-500 dark:text-white/70 leading-relaxed max-w-xs mx-auto">
            سیستم ورود و پیامک به‌طور کامل غیرفعال شده است.
          </p>
          <button
            type="button"
            onClick={closeAuth}
            className="mt-2 btn-cta px-6 py-2.5 rounded-full bg-apple-blue dark:bg-[#13ABC4] text-white text-sm font-bold"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
