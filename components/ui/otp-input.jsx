'use client';

import { useState, useEffect } from 'react';
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
      transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 30 }}
      className="w-16 h-16 bg-emerald-500 ring-4 ring-emerald-500/20 text-white flex items-center justify-center rounded-full"
    >
      <CheckIcon size={32} strokeWidth={3} />
    </motion.div>
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="text-emerald-400 font-semibold text-lg"
    >
      کد تأیید شد
    </motion.p>
  </div>
);

const OTPError = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="text-center text-red-400 font-medium mt-2 absolute -bottom-8 w-full"
  >
    کد نامعتبر است. دوباره تلاش کنید.
  </motion.div>
);

const OTPInputBox = ({ index, verifyOTP, state, length = 6 }) => {
  const animationControls = useAnimationControls();
  const springTransition = { type: 'spring', stiffness: 700, damping: 20, delay: index * 0.05 };
  const noDelay = { type: 'spring', stiffness: 700, damping: 20 };
  const slowSuccess = { type: 'spring', stiffness: 300, damping: 30, delay: index * 0.06 };

  useEffect(() => {
    animationControls.start({ opacity: 1, y: 0, transition: springTransition });
    return () => animationControls.stop();
  }, []);

  useEffect(() => {
    if (state === 'success') {
      animationControls.start({ x: -(index * 52), transition: slowSuccess });
    }
  }, [state, index, animationControls]);

  return (
    <motion.div
      className={`w-12 h-14 sm:w-14 sm:h-16 rounded-lg ring-2 overflow-hidden transition-all duration-300 ${
        state === 'error'
          ? 'ring-red-500'
          : state === 'success'
            ? 'ring-emerald-500'
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
        disabled={state === 'success'}
        onFocus={() => animationControls.start({ y: -5, transition: noDelay })}
        onBlur={() => animationControls.start({ y: 0, transition: noDelay })}
        onKeyDown={(e) => {
          const { value } = e.target;
          if (e.key === 'Backspace' && !value && index > 0) {
            document.getElementById(`otp-input-${index - 1}`)?.focus();
          } else if (e.key === 'ArrowLeft' && index > 0) {
            document.getElementById(`otp-input-${index - 1}`)?.focus();
          } else if (e.key === 'ArrowRight' && index < length - 1) {
            document.getElementById(`otp-input-${index + 1}`)?.focus();
          }
        }}
        onInput={(e) => {
          const value = e.target.value;
          if (value.match(/^[0-9]$/)) {
            e.target.value = value;
            if (index < length - 1) document.getElementById(`otp-input-${index + 1}`)?.focus();
          } else {
            e.target.value = '';
          }
          verifyOTP();
        }}
        onPaste={(e) => {
          e.preventDefault();
          const digits = e.clipboardData
            .getData('text')
            .trim()
            .slice(0, length)
            .split('')
            .filter((c) => /^[0-9]$/.test(c));
          digits.forEach((digit, i) => {
            const el = document.getElementById(`otp-input-${index + i}`);
            if (el) el.value = digit;
          });
          const next = Math.min(index + digits.length, length - 1);
          document.getElementById(`otp-input-${next}`)?.focus();
          setTimeout(verifyOTP, 0);
        }}
        className="w-full h-full text-center text-2xl sm:text-3xl font-semibold outline-none bg-zinc-950 text-zinc-50 caret-zinc-200"
      />
    </motion.div>
  );
};

export function OTPVerification({ phone = '', length = 6, onVerified, onResend, onBack }) {
  const [state, setState] = useState('idle');
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const animationControls = useAnimationControls();

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

  const getCode = () => {
    let code = '';
    for (let i = 0; i < length; i++) {
      const input = document.getElementById(`otp-input-${i}`);
      if (input) code += input.value;
    }
    return code;
  };

  const verifyOTP = () => {
    const code = getCode();
    if (code.length < length) {
      setState('idle');
      return;
    }
    // ظاهر: هر کد ۶ رقمی را موفق نشان بده — منطق واقعی بعداً
    if (code.length === length) {
      setState('success');
      try {
        if (typeof onVerified === 'function') onVerified(code);
      } catch (_) {}
      return;
    }
    setState('error');
    animationControls.start({
      x: [0, 5, -5, 5, -5, 0],
      transition: { duration: 0.3 },
    });
    setTimeout(() => {
      if (getCode().length < length) setState('idle');
    }, 500);
  };

  const handleResend = () => {
    setCountdown(60);
    setIsResendDisabled(true);
    setState('idle');
    for (let i = 0; i < length; i++) {
      const el = document.getElementById(`otp-input-${i}`);
      if (el) el.value = '';
    }
    try {
      if (typeof onResend === 'function') onResend();
    } catch (_) {}
  };

  return (
    <div className="w-full relative">
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

              <div className="flex flex-col items-center justify-center gap-2 mb-8 relative h-20">
                <motion.div animate={animationControls} className="flex items-center justify-center gap-3">
                  {Array.from({ length }).map((_, index) => (
                    <OTPInputBox key={index} index={index} verifyOTP={verifyOTP} state={state} length={length} />
                  ))}
                </motion.div>
                <AnimatePresence>{state === 'error' && <OTPError />}</AnimatePresence>
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
