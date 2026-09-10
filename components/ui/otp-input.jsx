'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';

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
      transition={{ delay: 0.3, duration: 0.4 }}
      className="text-emerald-400 font-semibold text-lg"
    >
      کد تأیید شد
    </motion.p>
  </div>
);

const OTPError = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="text-center text-red-400 font-medium mt-2 absolute -bottom-10 w-full px-2"
  >
    {message || 'کد نامعتبر است. دوباره تلاش کنید.'}
  </motion.div>
);

const OTPInputBox = ({ index, onDigit, state, length = 6, digit }) => {
  const animationControls = useAnimationControls();
  const springTransition = { type: 'spring', stiffness: 700, damping: 20, delay: index * 0.05 };
  const noDelay = { type: 'spring', stiffness: 700, damping: 20 };

  useEffect(() => {
    animationControls.start({ opacity: 1, y: 0, transition: springTransition });
    return () => animationControls.stop();
  }, []);

  return (
    <motion.div
      className={`w-9 h-11 sm:w-10 sm:h-12 rounded-md ring-2 overflow-hidden transition-all duration-300 shrink-0 ${
        state === 'error'
          ? 'ring-red-500'
          : state === 'success'
            ? 'ring-emerald-500'
            : state === 'loading'
              ? 'ring-zinc-500'
              : 'ring-zinc-700 focus-within:ring-zinc-400'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={animationControls}
    >
      <input
        id={`otp-input-${index}`}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={digit || ''}
        disabled={state === 'success' || state === 'loading'}
        onFocus={() => animationControls.start({ y: -5, transition: noDelay })}
        onBlur={() => animationControls.start({ y: 0, transition: noDelay })}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(-1);
          onDigit(index, v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !digit && index > 0) {
            document.getElementById(`otp-input-${index - 1}`)?.focus();
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
          if (!text) return;
          text.split('').forEach((ch, i) => onDigit(index + i, ch));
        }}
        className="pm-otp-cell w-full h-full text-center text-lg sm:text-xl font-semibold outline-none bg-zinc-950 !text-white caret-white"
        style={{ color: '#fff', WebkitTextFillColor: '#fff', caretColor: '#fff', backgroundColor: '#09090b' }}
        autoComplete={index === 0 ? 'one-time-code' : 'off'}
      />
    </motion.div>
  );
};

export function OTPVerification({ phone = '', length = 6, onVerified, onResend, onBack }) {
  const [state, setState] = useState('idle');
  const [digits, setDigits] = useState(() => Array(length).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [errMsg, setErrMsg] = useState('');
  const verifyingRef = useRef(false);
  const animationControls = useAnimationControls();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const code = digits.join('');

  const onDigit = (index, value) => {
    if (index < 0 || index >= length) return;
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < length - 1) {
      setTimeout(() => document.getElementById(`otp-input-${index + 1}`)?.focus(), 0);
    }
  };

  useEffect(() => {
    if (code.length !== length) {
      if (state === 'error') setState('idle');
      return;
    }
    if (verifyingRef.current || state === 'success' || state === 'loading') return;

    verifyingRef.current = true;
    setState('loading');
    setErrMsg('');

    (async () => {
      try {
        let ok = false;
        let message = '';
        if (typeof onVerified === 'function') {
          const result = await onVerified(code);
          // true / {ok:true} = success; false / {ok:false} = fail; undefined = treat as success for backward compat only if not object
          if (result === false) {
            ok = false;
            message = 'کد نامعتبر است';
          } else if (result && typeof result === 'object') {
            ok = !!result.ok;
            message = result.error || result.message || '';
          } else {
            ok = true;
          }
        } else {
          ok = true;
        }

        if (ok) {
          setState('success');
        } else {
          setState('error');
          setErrMsg(message || 'کد نامعتبر است. دوباره تلاش کنید.');
          setDigits(Array(length).fill(''));
          setTimeout(() => {
            setState('idle');
            document.getElementById('otp-input-0')?.focus();
          }, 1200);
        }
      } catch (e) {
        setState('error');
        setErrMsg(e?.message || 'خطا در تأیید');
        setDigits(Array(length).fill(''));
        setTimeout(() => setState('idle'), 1200);
      } finally {
        verifyingRef.current = false;
      }
    })();
  }, [code, length]);

  const isResendDisabled = countdown > 0;

  const handleResend = () => {
    if (isResendDisabled) return;
    setCountdown(60);
    setDigits(Array(length).fill(''));
    setState('idle');
    setErrMsg('');
    try {
      if (typeof onResend === 'function') onResend();
    } catch (_) {}
  };

  return (
    <div className="w-full relative">
      <div className="relative z-10">
        <h1 className="text-xl font-semibold text-center text-zinc-50 mb-2">
          {state === 'success' ? 'تأیید موفق' : state === 'loading' ? 'در حال بررسی…' : 'کد تأیید را وارد کنید'}
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

              <div className="flex flex-col items-center justify-center gap-2 mb-8 relative h-20">
                <motion.div animate={animationControls} className="flex items-center justify-center gap-1.5 sm:gap-2 w-full max-w-full px-1">
                  {Array.from({ length }).map((_, index) => (
                    <OTPInputBox
                      key={index}
                      index={index}
                      onDigit={onDigit}
                      state={state}
                      length={length}
                      digit={digits[index]}
                    />
                  ))}
                </motion.div>
                <AnimatePresence>{state === 'error' && <OTPError message={errMsg} />}</AnimatePresence>
              </div>

              <div className="text-center text-sm text-zinc-400">
                کد را نگرفتید؟{' '}
                {isResendDisabled ? (
                  <span className="text-zinc-500">ارسال مجدد تا {countdown} ثانیه</span>
                ) : (
                  <button type="button" className="text-zinc-200 underline" onClick={handleResend}>
                    ارسال مجدد
                  </button>
                )}
              </div>

              {typeof onBack === 'function' ? (
                <button type="button" className="mt-4 w-full text-sm text-zinc-500 hover:text-zinc-300" onClick={onBack}>
                  بازگشت
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
