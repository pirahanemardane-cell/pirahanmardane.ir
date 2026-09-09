"use client";

import { useEffect, useRef } from "react";

/**
 * OTP مدرن ۶ رقمی — فقط UI
 * value / onChange = authOtp / setAuthOtp
 */
export default function OtpBoxes({
  value = "",
  onChange,
  onComplete,
  length = 6,
  checking = false,
  disabled = false,
  error = false,
  className = "",
  autoFocus = true,
}) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .slice(0, length)
    .split("");
  while (digits.length < length) digits.push("");

  const refs = useRef([]);
  const completedRef = useRef("");
  const filledCount = digits.filter(Boolean).length;
  const firstEmpty = digits.findIndex((c) => !c);

  const emit = (arr) => {
    const next = arr.join("").replace(/\D/g, "").slice(0, length);
    if (typeof onChange === "function") onChange(next);

    if (next.length === length && next !== completedRef.current) {
      completedRef.current = next;
      if (typeof onComplete === "function") {
        requestAnimationFrame(() => {
          try {
            onComplete(next);
          } catch (_) {}
        });
      }
    }
    if (next.length < length) completedRef.current = "";
  };

  const setAt = (index, char) => {
    const d = digits.slice();
    d[index] = (char || "").replace(/\D/g, "").slice(-1);
    emit(d);
  };

  const onKeyDown = (e, index) => {
    if (disabled || checking) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) setAt(index, "");
      else if (index > 0) {
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
    if (raw.length > 1) {
      const d = digits.slice();
      for (let i = 0; i < raw.length && index + i < length; i++) {
        d[index + i] = raw[i];
      }
      emit(d);
      refs.current[Math.min(index + raw.length, length - 1)]?.focus();
      return;
    }
    setAt(index, raw);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const onPaste = (e) => {
    if (disabled || checking) return;
    e.preventDefault();
    const text = (e.clipboardData?.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!text) return;
    const d = Array.from({ length }, (_, i) => text[i] || "");
    emit(d);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  useEffect(() => {
    if (!autoFocus || checking || disabled) return;
    const t = setTimeout(() => {
      try {
        const idx = firstEmpty >= 0 ? firstEmpty : 0;
        refs.current[idx]?.focus();
      } catch (_) {}
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const half = Math.ceil(length / 2);

  const slotClass = (i, char) => {
    const filled = !!char;
    const active =
      !checking &&
      !disabled &&
      (i === firstEmpty || (filledCount === length && i === length - 1));

    if (checking) {
      return "border-emerald-500/70 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }
    if (error) {
      return "border-red-400/80 bg-red-500/5 text-red-600 dark:text-red-400";
    }
    if (active) {
      return "border-[#13ABC4] dark:border-[#13ABC4] bg-white dark:bg-primary-950/80 text-primary-900 dark:text-white shadow-[0_0_0_3px_rgba(19,171,196,0.22)] scale-[1.04]";
    }
    if (filled) {
      return "border-primary-300/90 dark:border-white/25 bg-white dark:bg-primary-950/60 text-primary-900 dark:text-white";
    }
    return "border-primary-200/80 dark:border-white/12 bg-primary-50/40 dark:bg-white/[0.03] text-primary-900 dark:text-white";
  };

  return (
    <div className={`w-full ${className}`} dir="ltr">
      <div
        className={`flex items-center justify-center gap-1.5 sm:gap-2 ${
          checking ? "pointer-events-none" : ""
        }`}
        onPaste={onPaste}
      >
        {digits.map((char, i) => (
          <div key={i} className="contents">
            {i === half ? (
              <span
                aria-hidden
                className="w-2 sm:w-2.5 h-0.5 rounded-full bg-primary-300/70 dark:bg-white/25 mx-0.5 shrink-0"
              />
            ) : null}
            <input
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
              aria-label={`رقم ${i + 1} از ${length}`}
              className={[
                "w-10 sm:w-12 rounded-2xl border text-center text-lg sm:text-xl font-bold font-mono tabular-nums",
                "focus:outline-none transition-all duration-200 ease-out",
                "disabled:opacity-80",
                slotClass(i, char),
              ].join(" ")}
              style={{ height: "3.25rem" }}
            />
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length }).map((_, i) => (
            <span
              key={i}
              className={[
                "h-1 rounded-full transition-all duration-300",
                i < filledCount
                  ? checking
                    ? "w-3 bg-emerald-500"
                    : error
                      ? "w-3 bg-red-400"
                      : "w-3 bg-[#13ABC4]"
                  : "w-1.5 bg-primary-200 dark:bg-white/15",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-primary-400 dark:text-white/45 tabular-nums">
          {checking
            ? "تأیید…"
            : error
              ? "کد نادرست"
              : filledCount === length
                ? "آماده"
                : `${filledCount}/${length}`}
        </span>
      </div>
    </div>
  );
}
