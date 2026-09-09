/**
 * WebOTP (Chrome Android) + پشتیبانی autocomplete برای Safari/iOS
 * input باید autoComplete="one-time-code" داشته باشد.
 */
import { useEffect } from 'react';

export function useWebOtp(onCode, options = {}) {
  const timeoutMs = options.timeoutMs ?? 120000;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!onCode) return undefined;

    // Chrome Android — WebOTP API
    if (!('OTPCredential' in window) || !navigator.credentials?.get) {
      return undefined;
    }

    const ac = new AbortController();
    const timer = setTimeout(() => {
      try { ac.abort(); } catch (_) {}
    }, timeoutMs);

    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: ac.signal })
      .then((otp) => {
        const code = otp && otp.code ? String(otp.code).trim() : '';
        if (code) onCode(code);
      })
      .catch(() => {
        /* کاربر رد کرد یا SMS با فرمت WebOTP نیامد — دستی وارد می‌کند */
      });

    return () => {
      clearTimeout(timer);
      try { ac.abort(); } catch (_) {}
    };
  }, [onCode, timeoutMs]);
}

export default useWebOtp;
