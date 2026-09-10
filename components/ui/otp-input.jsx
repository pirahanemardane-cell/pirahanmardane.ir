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

export function OTPVerification({ phone = '', length = 6, onVerified, onResend, onBack }) {
  const [digits, setDigits] = useState(() => Array.from({ length }, () => ''));
  const [state, setState] = useState('idle');
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const refs = useRef([]);

  useEffect(() => {
    setDigits(Array.from({ length }, () => ''));
  }, [length]);

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

  const applyDigits = (next) => {
    const clean = next.slice(0, length);
    while (clean.length < length) clean.push('');
    setDigits(clean);
    setState('idle');
    const code = clean.join('');
    if (code.length === length && clean.every(Boolean)) {
      setState('success');
      try {
        if (typeof onVerified === 'function') onVerified(code);
      } catch (_) {}
    }
  };

  const onChangeAt = (index, raw) => {
    if (state === 'success') return;
    const chars = onlyDigits(raw);

    // paste or multi-digit from mobile keyboard
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

    if (next[index] && index < length - 1) {
      focusAt(index + 1);
    }
  };

  const onKeyDown = (e, index) => {
    if (state === 'success') return;
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
    setDigits(Array.from({ length }, () => ''));
    focusAt(0);
    try {
      if (typeof onResend === 'function') onResend();
    } catch (_) {}
  };

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
      `}</style>

      <div className="relative z-10">
        <h1 className="text-xl font-semibold text-center text-zinc-50 mb-2">
          {state === 'success' ? 'تأیید موفق' : 'کد تأیید را وارد کنید'}
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
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-center text-zinc-400 mt-2 mb-6 text-sm">
                کد ۶ رقمی به این شماره ارسال شد
                <br />
                <span dir="ltr" className="font-medium text-zinc-200">
                  {phone || '09xxxxxxxxx'}
                </span>
              </p>

              <div className="flex flex-col items-center justify-center gap-2 mb-8 relative min-h-[3rem]" dir="ltr">
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
                      maxLength={length}
                      value={d}
                      disabled={state === 'success'}
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
