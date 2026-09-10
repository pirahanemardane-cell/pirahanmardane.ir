'use client';


import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function toEnDigit(ch) {
  const map = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return map[ch] || ch;
}

function onlyDigits(str) {
  return String(str || '')
    .split('')
    .map(toEnDigit)
    .filter((c) => c >= '0' && c <= '9')
    .join('');
}

const CheckIcon = ({ size = 16, strokeWidth = 3, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = ({ size = 16, strokeWidth = 3, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const OTPSuccess = () => (
  <div className="flex items-center justify-center gap-4 w-full">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
      className="w-16 h-16 bg-emerald-500 ring-4 ring-emerald-500/20 text-white flex items-center justify-center rounded-full"
    >
      <CheckIcon size={32} strokeWidth={3} />
    </motion.div>
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-emerald-400 font-semibold text-lg"
    >
      کد تأیید شد
    </motion.p>
  </div>
);

const OTPError = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 w-full py-2">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-16 h-16 bg-red-500 ring-4 ring-red-500/25 text-white flex items-center justify-center rounded-full"
    >
      <XIcon size={32} strokeWidth={3} />
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-400 font-semibold text-base text-center"
    >
      {message || 'کد وارد شده صحیح نمی‌باشد.'}
    </motion.p>
  </div>
);

/**
 * OTP مشترک خریدار / فروشنده / ادمین
 * موفقیت فقط بعد از تأیید API — خطای اشتباه: ضربدر قرمز + پیام
 */
export function OTPVerification({ phone = '', length = 6, onVerified, onResend, onBack }) {
  const [digits, setDigits] = useState(() => Array.from({ length }, () => ''));
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const refs = useRef([]);
  const verifiedOnce = useRef(false);
  const abortRef = useRef(null);

  useEffect(() => {
    setDigits(Array.from({ length }, () => ''));
    verifiedOnce.current = false;
    setState('idle');
    setErrorMsg('');
  }, [length, phone]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        refs.current[0]?.focus();
      } catch (_) {}
    }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let timer;
    if (isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResendDisabled]);

  const focusAt = (i) => {
    const idx = Math.max(0, Math.min(length - 1, i));
    requestAnimationFrame(() => {
      try {
        refs.current[idx]?.focus();
        refs.current[idx]?.select?.();
      } catch (_) {}
    });
  };

  const finishIfComplete = async (clean) => {
    const code = clean.join('');
    if (code.length !== length || !clean.every(Boolean)) return false;
    if (verifiedOnce.current) return true;
    verifiedOnce.current = true;
    setErrorMsg('');
    setState('loading');
    try {
      let result = { ok: true };
      if (typeof onVerified === 'function') {
        result = await onVerified(code);
      }
      if (result && result.ok === false) {
        verifiedOnce.current = false;
        setErrorMsg(result.error || 'کد وارد شده صحیح نمی‌باشد.');
        setState('error');
        setDigits(Array.from({ length }, () => ''));
        setTimeout(() => focusAt(0), 100);
        // بعد از ۲.۵ ثانیه برگرد به فرم برای تلاش مجدد
        setTimeout(() => {
          setState((s) => (s === 'error' ? 'idle' : s));
          setErrorMsg('');
          setTimeout(() => focusAt(0), 50);
        }, 2500);
        return false;
      }
      setState('success');
      return true;
    } catch (e) {
      verifiedOnce.current = false;
      setErrorMsg(e?.message || 'کد وارد شده صحیح نمی‌باشد.');
      setState('error');
      setDigits(Array.from({ length }, () => ''));
      setTimeout(() => {
        setState((s) => (s === 'error' ? 'idle' : s));
        setErrorMsg('');
        setTimeout(() => focusAt(0), 50);
      }, 2500);
      return false;
    }
  };

  const applyDigits = (next) => {
    const clean = next.slice(0, length);
    while (clean.length < length) clean.push('');
    setDigits(clean);
    if (state === 'error') {
      setState('idle');
      setErrorMsg('');
    } else if (state !== 'success' && state !== 'loading') {
      setState('idle');
    }
    if (state !== 'loading' && state !== 'success') {
      finishIfComplete(clean);
    }
  };

  const fillFromAutofill = (codeRaw) => {
    const code = onlyDigits(codeRaw).slice(0, length);
    if (!code) return;
    const next = Array.from({ length }, (_, i) => code[i] || '');
    applyDigits(next);
    focusAt(Math.min(code.length, length - 1));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (state === 'success' || state === 'loading') return;

    if (!navigator.credentials || typeof navigator.credentials.get !== 'function') return;

    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const cred = await navigator.credentials.get({
          otp: { transport: ['sms'] },
          signal: ac.signal,
        });
        if (cred && cred.code) {
          fillFromAutofill(cred.code);
        }
      } catch (_) {}
    })();

    return () => {
      try {
        ac.abort();
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, length]);

  const onChangeAt = (index, raw) => {
    if (state === 'success' || state === 'loading') return;
    const chars = onlyDigits(raw);

    if (chars.length > 1) {
      const next = digits.slice();
      for (let i = 0; i < chars.length && index + i < length; i++) {
        next[index + i] = chars[i];
      }
      applyDigits(next);
      focusAt(Math.min(index + chars.length, length - 1));
      return;
    }

    const next = digits.slice();
    next[index] = chars.slice(-1) || '';
    applyDigits(next);
    if (next[index] && index < length - 1) focusAt(index + 1);
  };

  const onKeyDown = (e, index) => {
    if (state === 'success' || state === 'loading') return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = '';
        applyDigits(next);
        focusAt(index);
      } else if (index > 0) {
        next[index - 1] = '';
        applyDigits(next);
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const onPaste = (e, index) => {
    e.preventDefault();
    if (state === 'success' || state === 'loading') return;
    const chars = onlyDigits(e.clipboardData?.getData('text') || '');
    if (!chars) return;
    const next = digits.slice();
    for (let i = 0; i < chars.length && index + i < length; i++) {
      next[index + i] = chars[i];
    }
    applyDigits(next);
    focusAt(Math.min(index + chars.length, length - 1));
  };

  const handleResend = () => {
    setCountdown(60);
    setIsResendDisabled(true);
    setState('idle');
    setErrorMsg('');
    verifiedOnce.current = false;
    setDigits(Array.from({ length }, () => ''));
    focusAt(0);
    try {
      if (typeof onResend === 'function') onResend();
    } catch (_) {}
  };

  const locked = state === 'success' || state === 'loading';

  return (
    <div className="w-full relative">
      <style>{`
        input.pm-otp-cell {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          background-color: #09090b !important;
        }
        input.pm-otp-cell:-webkit-autofill,
        input.pm-otp-cell:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          box-shadow: 0 0 0px 1000px #09090b inset !important;
          transition: background-color 9999s ease-out;
        }
        input.pm-otp-cell.pm-otp-error {
          border-color: #ef4444 !important;
        }
        .pm-otp-autofill-host {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          height: 0;
          width: 0;
          overflow: hidden;
        }
      `}</style>

      <div className="pm-otp-autofill-host" aria-hidden="true">
        <input
          type="text"
          name="one-time-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          tabIndex={-1}
          value={digits.join('')}
          onChange={(e) => fillFromAutofill(e.target.value)}
          readOnly={locked}
        />
      </div>

      <div className="relative z-10">
        <h1 className="text-xl font-semibold text-center text-zinc-50 mb-2">
          {state === 'success' ? 'تأیید موفق' : state === 'error' ? 'کد نادرست' : 'کد تأیید را وارد کنید'}
        </h1>

        <AnimatePresence mode="wait">
          {state === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center py-10"
            >
              <OTPSuccess />
            </motion.div>
          ) : state === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex items-center justify-center py-8"
            >
              <OTPError message={errorMsg || 'کد وارد شده صحیح نمی‌باشد.'} />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-center text-zinc-400 mt-2 mb-6 text-sm">
                کد ۶ رقمی به این شماره ارسال شد
                <br />
                <span dir="ltr" className="font-medium text-zinc-200">
                  {phone || '09xxxxxxxxx'}
                </span>
              </p>

              <div className="flex flex-col items-center justify-center gap-2 mb-4 relative min-h-[3rem]" dir="ltr">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full">
                  {digits.map((d, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        refs.current[index] = el;
                      }}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      name={index === 0 ? 'one-time-code' : undefined}
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      maxLength={length}
                      value={d}
                      disabled={locked}
                      onChange={(e) => onChangeAt(index, e.target.value)}
                      onKeyDown={(e) => onKeyDown(e, index)}
                      onPaste={(e) => onPaste(e, index)}
                      onFocus={(e) => {
                        try {
                          e.target.select();
                        } catch (_) {}
                      }}
                      aria-label={`رقم ${index + 1}`}
                      className="pm-otp-cell w-9 h-11 sm:w-10 sm:h-12 rounded-md border border-zinc-700 text-center text-lg sm:text-xl font-semibold outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 shrink-0"
                      style={{ color: '#fff', WebkitTextFillColor: '#fff', caretColor: '#fff', backgroundColor: '#09090b' }}
                    />
                  ))}
                </div>
                {state === 'loading' ? (
                  <p className="text-zinc-400 text-sm mt-2">در حال بررسی کد…</p>
                ) : null}
              </div>

              <div className="text-center text-sm text-zinc-400">
                کد را نگرفتید؟{' '}
                {isResendDisabled ? (
                  <span className="text-zinc-500">ارسال مجدد تا {countdown} ثانیه</span>
                ) : (
                  <button type="button" onClick={handleResend} className="font-medium text-zinc-100 hover:underline">
                    ارسال مجدد
                  </button>
                )}
              </div>

              {typeof onBack === 'function' ? (
                <button type="button" onClick={onBack} className="mt-4 w-full text-center text-sm text-zinc-400 hover:text-zinc-200">
                  تغییر شماره
                </button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OTPVerification;
