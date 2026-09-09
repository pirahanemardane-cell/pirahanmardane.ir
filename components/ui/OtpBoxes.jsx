"use client";

import { useEffect, useRef } from "react";

/**
 * OTP شش‌رقمی — سازگار با AuthModal (authOtp / setAuthOtp)
 * props:
 *   value, onChange, length=6, checking, disabled, phone
 */
export default function OtpBoxes({
  value = "",
  onChange,
  length = 6,
  checking = false,
  disabled = false,
  className = "",
}) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, length)
    .split("");
  while (digits.length < length) digits.push("");

  const refs = useRef([]);

  const emit = (arr) => {
    const next = arr.join("").replace(/\D/g, "").slice(0, length);
    if (typeof onChange === "function") onChange(next);
  };

  const setAt = (index, char) => {
    const d = digits.slice();
    d[index] = char.replace(/\D/g, "").slice(-1) || "";
    emit(d);
  };

  const onKeyDown = (e, index) => {
    if (disabled || checking) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setAt(index, "");
      } else if (index > 0) {
        setAt(index - 1, "");
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const onChangeBox = (e, index) => {
    if (disabled || checking) return;
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setAt(index, "");
      return;
    }
    // paste چند رقم در یک باکس
    if (raw.length > 1) {
      const d = digits.slice();
      for (let i = 0; i < raw.length && index + i < length; i++) {
        d[index + i] = raw[i];
      }
      emit(d);
      const focusIdx = Math.min(index + raw.length, length - 1);
      refs.current[focusIdx]?.focus();
      return;
    }
    setAt(index, raw);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const onPaste = (e) => {
    if (disabled || checking) return;
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    const d = Array.from({ length }, (_, i) => text[i] || "");
    emit(d);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  useEffect(() => {
    if (!checking && !disabled) {
      const firstEmpty = digits.findIndex((c) => !c);
      const idx = firstEmpty === -1 ? length - 1 : firstEmpty;
      refs.current[idx]?.focus();
    }
    // فقط وقتی value از بیرون کامل می‌شود (مثلاً WebOTP)
  }, [value, checking, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`w-full ${className}`} dir="ltr">
      <div
        className={`flex items-center justify-center gap-2 sm:gap-2.5 ${
          checking ? "pm-otp-checking" : ""
        }`}
        onPaste={onPaste}
      >
        {digits.map((char, i) => {
          const filled = !!char;
          const active = !checking && !disabled && (i === digits.findIndex((c) => !c) || (digits.every(Boolean) && i === length - 1));
          return (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              name={i === 0 ? "one-time-code" : undefined}
              maxLength={length}
              value={char}
              disabled={disabled || checking}
              onChange={(e) => onChangeBox(e, i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              aria-label={`رقم ${i + 1}`}
              className={[
                "w-11 h-14 sm:w-12 sm:h-14 rounded-xl border text-center text-xl font-bold font-mono",
                "bg-white dark:bg-primary-950/60 text-primary-900 dark:text-white",
                "focus:outline-none transition-all duration-200",
                checking
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse"
                  : active
                    ? "border-green-500 ring-2 ring-green-500/30"
                    : filled
                      ? "border-primary-300 dark:border-white/30"
                      : "border-primary-200 dark:border-white/20",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-mono text-primary-400 dark:text-white/50">
        {checking
          ? "در حال تأیید…"
          : digits.filter(Boolean).length < length
            ? `${digits.filter(Boolean).length} / ${length}`
            : "کد کامل شد"}
      </p>
    </div>
  );
}
