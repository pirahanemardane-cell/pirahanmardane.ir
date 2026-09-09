"use client";

import { useState, useEffect, useRef, useContext } from "react";
import ParticleSphereAnimation from "@/components/ui/input-otp-10-utils/particalsphear";
import { REGEXP_ONLY_DIGITS, OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";

const SPRING = { type: "spring", stiffness: 450, damping: 28 };

function CustomOTPSlot({ index, isSuccess }) {
  const ctx = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = ctx?.slots?.[index] ?? {};
  const [pulseKey, setPulseKey] = useState(0);
  const prev = useRef(char);

  useEffect(() => {
    if (char && char !== prev.current) setPulseKey((p) => p + 1);
    prev.current = char;
  }, [char]);

  return (
    <div
      className={cn(
        "relative flex h-14 w-11 sm:w-12 items-center justify-center rounded-xl border transition-all duration-300 font-mono text-xl font-bold select-none",
        isSuccess
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
          : isActive
            ? "border-green-500 bg-green-500/5 dark:border-green-400"
            : "border-primary-200 dark:border-white/20 text-primary-900 dark:text-white"
      )}
    >
      <AnimatePresence mode="popLayout">
        {char ? (
          <motion.span
            key={String(char) + index}
            initial={{ opacity: 0, scale: 0.5, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -6 }}
            transition={SPRING}
            className="absolute font-mono text-xl"
          >
            {char}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {pulseKey > 0 ? (
          <motion.div
            key={pulseKey}
            className="absolute inset-0 rounded-xl border border-green-500 pointer-events-none"
            initial={{ opacity: 0.8, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.4 }}
          />
        ) : null}
      </AnimatePresence>
      {hasFakeCaret && !isSuccess ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="bg-green-500 h-6 w-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function InputOtp10({
  value = "",
  onChange,
  isVerifying = false,
  phone = "",
  compact = true,
  className,
}) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 6);
  const setValue = (v) => {
    if (typeof onChange === "function") {
      onChange(String(v || "").replace(/\D/g, "").slice(0, 6));
    }
  };

  return (
    <div
      className={cn(
        "relative w-full mx-auto rounded-2xl border border-primary-200 dark:border-white/15 bg-white/80 dark:bg-primary-950/40 p-5 backdrop-blur-xl overflow-hidden select-none",
        className
      )}
    >
      <div className="flex flex-col items-center gap-5">
        {!compact ? (
          <div className="relative w-36 h-36 flex items-center justify-center">
            <ParticleSphereAnimation className="w-28 h-28" />
            {isVerifying ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="text-center">
          <h3 className="text-sm font-bold text-primary-900 dark:text-white">
            {isVerifying ? "در حال بررسی کد…" : "کد تأیید را وارد کنید"}
          </h3>
          <p className="text-xs text-primary-500 dark:text-white/60 mt-1">
            {phone
              ? `کد ۶ رقمی ارسال‌شده به ${phone}`
              : "کد ۶ رقمی پیامک را وارد کنید"}
          </p>
        </div>

        <div className="w-full flex justify-center" dir="ltr">
          <OTPInput
            maxLength={6}
            value={digits}
            onChange={setValue}
            pattern={REGEXP_ONLY_DIGITS}
            disabled={!!isVerifying}
            containerClassName="flex items-center justify-center gap-2"
            autoFocus
          >
            <div className="flex items-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <CustomOTPSlot key={i} index={i} isSuccess={!!isVerifying} />
              ))}
            </div>
          </OTPInput>
        </div>

        <p className="text-xs font-mono text-primary-400 dark:text-white/50">
          {isVerifying
            ? "در حال تأیید…"
            : digits.length < 6
              ? `${digits.length} / 6`
              : "کد کامل شد"}
        </p>
      </div>
    </div>
  );
}
