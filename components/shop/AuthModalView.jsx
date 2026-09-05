'use client';

import { useEffect, useState } from 'react';
import { useAppApi } from '../AppApiContext';

/**
 * مودال ورود خریدار / فروشنده — فقط OTP
 * جریان:
 *  phone → otp → (اگر جدید) name → پنل
 *  اگر از قبل ثبت‌نام کرده → مستقیم پنل (خریدار یا فروشنده)
 *  اگر از checkout آمده → بعد از ورود به تسویه
 * ادمین جدا است و اینجا دست زده نمی‌شود.
 */
export default function AuthModalView() {
  const {
    Icon,
    authError,
    authLastName,
    authLoading,
    authMode,
    authName,
    authOpen,
    authOtp,
    authOtpTimer,
    authPhone,
    authStep,
    authTermsAccepted,
    authPassword,
    setAuthPassword,
    authLoginMethod,
    setAuthLoginMethod,
    authRemember,
    setAuthRemember,
    closeAuth,
    completeRegister,
    onlyDigits,
    openStaticPage,
    sendOtp,
    setAuthError,
    setAuthLastName,
    setAuthName,
    setAuthOtp,
    setAuthPhone,
    setAuthStep,
    setAuthTermsAccepted,
    toFa,
    verifyOtp,
    loginWithPassword,
    verifyMfa,
    resendMfa,
  } = useAppApi();

  const [uiLoginMethod, setUiLoginMethod] = useState('otp');
  const [uiRemember, setUiRemember] = useState(true);
  const [uiPassword, setUiPassword] = useState('');

  // Web OTP (Chrome/Android) — Safari از autocomplete=one-time-code استفاده می‌کند
  useEffect(() => {
    if ((authStep !== 'otp' && authStep !== 'mfa') || typeof window === 'undefined') return;
    if (typeof window.OTPCredential === 'undefined') return;
    const ac = new AbortController();
    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: ac.signal,
      })
      .then((otp) => {
        if (otp && otp.code) {
          const code = onlyDigits(otp.code).slice(0, 6);
          setAuthOtp(code);
          setAuthError('');
        }
      })
      .catch(() => {});
    return () => {
      try {
        ac.abort();
      } catch (_) {}
    };
  }, [authStep, onlyDigits, setAuthOtp, setAuthError]);

  if (!authOpen) return null;

  const isSeller = authMode === 'seller';
  const title =
    authStep === 'phone'
      ? isSeller
        ? 'ورود فروشنده'
        : 'ورود خریدار'
      : authStep === 'otp' || authStep === 'mfa'
        ? 'کد تأیید'
        : isSeller
          ? 'اطلاعات فروشگاه'
          : 'تکمیل ثبت‌نام';

  const subtitle =
    authStep === 'phone'
      ? 'شماره موبایل خود را وارد کنید؛ کد تأیید پیامک می‌شود'
      : authStep === 'otp' || authStep === 'mfa'
        ? (
            <>
              کد ارسال‌شده به{' '}
              <span dir="ltr" className="font-medium text-primary-700 dark:text-white/90">
                {authPhone}
              </span>{' '}
              را وارد کنید
            </>
          )
        : isSeller
          ? 'نام فروشگاه و مسئول را وارد کنید'
          : 'نام خود را وارد کنید تا ثبت‌نام کامل شود';

  return (
    <div className="site-modal-root" role="dialog" aria-modal="true" aria-label={title}>
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

        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FF7171] dark:bg-[#13ABC4] text-white flex items-center justify-center transition-colors">
            <Icon name="user" size={22} className="!text-white" />
          </div>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white">{title}</h3>
          <p className="text-xs text-primary-500 dark:!text-white mt-1">{subtitle}</p>
        </div>

        {authError ? (
          <p className="text-xs text-red-500 text-center mb-3 whitespace-pre-wrap">{authError}</p>
        ) : null}

        {/* مرحله ۱: شماره */}
        {authStep === 'phone' && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError('');
              try {
                if (uiLoginMethod === 'password') {
                  if (loginWithPassword) {
                    // sync password into parent if possible
                    try { window.__pmAuthPassword = uiPassword; setAuthPassword && setAuthPassword(uiPassword); } catch (_) { try { window.__pmAuthPassword = uiPassword; } catch(_){} }
                    try { window.__pmAuthRemember = uiRemember; setAuthRemember && setAuthRemember(uiRemember); } catch (_) { try { window.__pmAuthRemember = uiRemember; } catch(_){} }
                    await loginWithPassword();
                  } else {
                    const res = await fetch('/api/auth/login-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ phone: authPhone, password: uiPassword, remember: uiRemember }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data?.ok) {
                      setAuthError(data?.error || 'ورود ناموفق');
                      return;
                    }
                    window.location.reload();
                  }
                } else {
                  sendOtp && sendOtp();
                }
              } catch (err) {
                setAuthError(err?.message || 'خطا');
              }
            }}
          >
            <div className="flex rounded-full border border-primary-200 dark:border-white/20 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setUiLoginMethod('otp')}
                className={`flex-1 py-2 rounded-full transition ${uiLoginMethod === 'otp' ? 'bg-apple-blue text-white dark:bg-[#13ABC4]' : 'text-primary-600 dark:text-white/70'}`}
              >
                ورود با پیامک
              </button>
              <button
                type="button"
                onClick={() => setUiLoginMethod('password')}
                className={`flex-1 py-2 rounded-full transition ${uiLoginMethod === 'password' ? 'bg-apple-blue text-white dark:bg-[#13ABC4]' : 'text-primary-600 dark:text-white/70'}`}
              >
                ورود با رمز
              </button>
            </div>
            <input
              type="tel"
              name="tel"
              inputMode="numeric"
              value={authPhone || ''}
              onChange={(e) => {
                setAuthPhone(onlyDigits(e.target.value).slice(0, 11));
                setAuthError('');
              }}
              dir="ltr"
              placeholder="09xxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-center text-base tracking-widest text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
              autoFocus
              autoComplete="tel"
            />
            {uiLoginMethod === 'password' && (
              <input
                type="password"
                value={uiPassword}
                onChange={(e) => setUiPassword(e.target.value)}
                placeholder="رمز عبور"
                className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-center text-base text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
                autoComplete="current-password"
              />
            )}
            <label className="flex items-center gap-2 justify-center text-xs text-primary-600 dark:text-white/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uiRemember}
                onChange={(e) => setUiRemember(e.target.checked)}
                className="rounded border-primary-300"
              />
              مرا به خاطر بسپار
            </label>
            <button
              type="submit"
              disabled={
                authLoading ||
                onlyDigits(authPhone || '').length < 11 ||
                (uiLoginMethod === 'password' && !uiPassword)
              }
              className="btn-cta w-full py-3 rounded-full bg-apple-blue dark:bg-[#13ABC4] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition"
            >
              {authLoading
                ? 'لطفاً صبر کنید...'
                : uiLoginMethod === 'password'
                  ? 'ورود با رمز'
                  : 'دریافت کد تأیید'}
            </button>
            <p className="text-xs text-center text-primary-400">
              با ادامه، قوانین را می‌پذیرید.
              {uiLoginMethod === 'password' ? ' اگر رمز ندارید با پیامک وارد شوید و در پنل رمز بسازید.' : ''}
            </p>
          </form>
        )}

        {/* مرحله ۲: OTP */}
        {authStep === 'otp' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                verifyOtp && verifyOtp();
              } catch (_) {}
            }}
          >
            <input
              id="otp-code-input"
              type="text"
              name="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              value={authOtp || ''}
              onChange={(e) => {
                const code = onlyDigits(e.target.value).slice(0, 6);
                setAuthOtp(code);
                setAuthError('');
              }}
              dir="ltr"
              placeholder="------"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-center text-xl tracking-[0.4em] text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
              autoFocus
            />
            <button
              type="submit"
              disabled={authLoading || onlyDigits(authOtp || '').length < 4}
              className="btn-cta w-full py-3 rounded-full bg-apple-blue dark:bg-[#13ABC4] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition whitespace-nowrap shrink-0"
            >
              {authLoading
                ? 'در حال بررسی...'
                : isSeller
                  ? 'تأیید و ورود فروشنده'
                  : 'تأیید و ادامه'}
            </button>
            <div className="flex items-center justify-between text-xs text-primary-500">
              <button
                type="button"
                onClick={() => {
                  setAuthStep('phone');
                  setAuthOtp('');
                  setAuthError('');
                }}
                className="hover:text-apple-blue"
              >
                تغییر شماره
              </button>
              {authOtpTimer > 0 ? (
                <span>ارسال مجدد تا {toFa(authOtpTimer)} ثانیه</span>
              ) : (
                <button type="button" onClick={() => sendOtp && sendOtp()} className="text-apple-blue font-medium">
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </form>
        )}

  
      {/* مرحله MFA: کد دو مرحله‌ای بعد از ورود با رمز */}
      {authStep === 'mfa' && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              verifyMfa && verifyMfa();
            } catch (_) {}
          }}
        >
          <p className="text-xs text-primary-500 text-center">
            کد تأیید دو مرحله‌ای به{' '}
            <span dir="ltr" className="font-medium text-primary-700 dark:text-white/90">
              {authPhone}
            </span>{' '}
            ارسال شد
          </p>
          <input
            type="text"
            name="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={authOtp || ''}
            onChange={(e) => {
              const code = onlyDigits(e.target.value).slice(0, 6);
              setAuthOtp(code);
              setAuthError('');
            }}
            dir="ltr"
            placeholder="------"
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-center text-xl tracking-[0.4em] text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
            autoFocus
          />
          <button
            type="submit"
            disabled={authLoading || onlyDigits(authOtp || '').length !== 6}
            className="btn-cta w-full py-3 rounded-full bg-apple-blue dark:bg-[#13ABC4] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition"
          >
            {authLoading ? 'در حال بررسی...' : 'تأیید و ورود'}
          </button>
          <div className="flex items-center justify-between text-xs text-primary-500">
            <button
              type="button"
              onClick={() => {
                setAuthStep('phone');
                setAuthOtp('');
                setAuthError('');
              }}
              className="hover:text-apple-blue"
            >
              بازگشت
            </button>
            {authOtpTimer > 0 ? (
              <span>ارسال مجدد تا {toFa(authOtpTimer)} ثانیه</span>
            ) : (
              <button
                type="button"
                onClick={() => { try { resendMfa && resendMfa(); } catch (_) {} }}
                className="text-apple-blue font-medium"
                disabled={authLoading}
              >
                ارسال مجدد کد
              </button>
            )}
          </div>
        </form>
      )}

      {/* مرحله ۳: ثبت‌نام (فقط کاربر جدید) */}
        {authStep === 'name' && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              try {
                completeRegister && completeRegister();
              } catch (_) {}
            }}
          >
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={authName || ''}
              onChange={(e) => setAuthName(e.target.value)}
              placeholder={isSeller ? 'نام فروشگاه *' : 'نام *'}
              className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
              autoFocus
            />
            <input
              type="text"
              name="family-name"
              autoComplete="family-name"
              value={authLastName || ''}
              onChange={(e) => setAuthLastName(e.target.value)}
              placeholder={isSeller ? 'نام مسئول *' : 'نام‌خانوادگی'}
              className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-primary-900 dark:text-white focus:outline-none focus:border-apple-blue"
            />
            <p className="text-[11px] text-primary-400 text-center" dir="ltr">
              {authPhone}
            </p>
            <label className="flex items-start gap-2 text-xs text-primary-600 dark:text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={!!authTermsAccepted}
                onChange={(e) => setAuthTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                قوانین و شرایط و حریم خصوصی را می‌پذیرم.{' '}
                <button
                  type="button"
                  className="text-apple-blue underline"
                  onClick={() => {
                    closeAuth();
                    openStaticPage && openStaticPage('terms');
                  }}
                >
                  مشاهده
                </button>
              </span>
            </label>
            <button
              type="submit"
              disabled={authLoading}
              className="btn-cta w-full py-3 rounded-full bg-apple-blue dark:bg-[#13ABC4] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition"
            >
              {isSeller ? 'ثبت و ورود به پنل' : 'تکمیل ثبت‌نام'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
