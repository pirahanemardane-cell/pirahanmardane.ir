'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, X, User } from 'lucide-react';
import { patchModalUi } from '@/lib/stores/modalUiStore';
import OTPVerification from '@/components/ui/otp-input';

function cn(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ');
}

function Card({ className, ...props }) {
  return <div className={cn('rounded-lg border shadow-sm', className)} {...props} />;
}
function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}
function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />;
}
function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm', className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}
function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}
function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium leading-none', className)} {...props} />;
}
function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn('flex h-9 w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none', className)}
      {...props}
    />
  );
}
function Button({ className, variant = 'default', type = 'button', children, ...props }) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50';
  const variants = {
    default: 'bg-zinc-50 text-zinc-900 hover:bg-zinc-200',
    outline: 'border border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80',
  };
  return (
    <button type={type} className={cn(base, variants[variant] || variants.default, className)} {...props}>
      {children}
    </button>
  );
}
function Checkbox({ id, checked, onChange, className }) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={onChange}
      className={cn('h-4 w-4 rounded border border-zinc-700 bg-zinc-950 accent-zinc-50', className)}
    />
  );
}
function Separator({ className }) {
  return <div className={cn('h-px w-full bg-zinc-800', className)} />;
}

function forceCloseAuth(onClose) {
  try {
    patchModalUi({ authOpen: false });
  } catch (_) {}
  try {
    if (typeof onClose === 'function') onClose();
  } catch (_) {}
}

function goContact(onContact, onClose) {
  forceCloseAuth(onClose);
  try {
    if (typeof onContact === 'function') {
      onContact();
      return;
    }
  } catch (_) {}
  try {
    window.location.assign('/تماس-با-ما');
  } catch (_) {
    try {
      window.location.href = '/تماس-با-ما';
    } catch (__) {}
  }
}

export default function LoginCardSection({ mode = 'buyer', onClose, onContact }) {
  const [view, setView] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState('');
  const [forgotStep, setForgotStep] = useState('phone');
  const [resetPassword, setResetPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [closed, setClosed] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const canvasRef = useRef(null);
  const isSeller = mode === 'seller';
  const isAdmin = mode === 'admin';
  React.useEffect(() => {
    if (isAdmin && (view === 'signup' || view === 'forgot')) setView('signin');
  }, [isAdmin, view]);
  const role = isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer';

  
  function goAfterAuth(data) {
    const profile = data?.profile || {};
    const user = data?.user || {};
    const r = String(profile?.role || (isAdmin ? 'admin' : role) || 'buyer').toLowerCase();
    const phone = String(profile?.phone || user?.phone || smsPhone || emailOrPhone || '').replace(/\D/g, '');
    const name = profile?.full_name || profile?.name || 'کاربر';
    const id = profile?.id || user?.id || null;
    const sessionExpires = Date.now() + 30 * 24 * 60 * 60 * 1000;
    try { patchModalUi({ authOpen: false }); } catch (_) {}
    try { if (typeof onClose === 'function') onClose(); } catch (_) {}

    try {
      if (r === 'admin') {
        localStorage.setItem('adminUser', JSON.stringify({
          id, phone, name, role: 'admin', loggedAt: Date.now(), sessionExpires,
        }));
        sessionStorage.setItem('pm_panel', 'admin');
        window.location.href='/amirshn?panel=1';
        return;
      }
      if (r === 'seller') {
        localStorage.setItem('sellerUser', JSON.stringify({
          id, phone, name, role: 'seller', sessionExpires,
        }));
        sessionStorage.setItem('pm_panel', 'seller');
        window.location.assign('/seller');
        return;
      }
      localStorage.setItem('buyerUser', JSON.stringify({
        id, phone, name, role: 'buyer', sessionExpires,
      }));
      sessionStorage.setItem('pm_panel', 'account');
      window.location.assign('/account');
    } catch (e) {
      window.location.assign(r === 'admin' ? '/amirshn' : r === 'seller' ? '/seller' : '/account');
    }
  }


  const redirectAfterAuth = (profile) => {
    const phone = String(
      (profile && (profile.phone || profile.mobile)) ||
        smsPhone ||
        emailOrPhone ||
        ''
    ).replace(/\D/g, '');
    const r = isAdmin
      ? 'admin'
      : String((profile && profile.role) || role || 'buyer').toLowerCase();

    try { if (typeof onClose === 'function') onClose(); } catch (_) {}
    try { patchModalUi({ authOpen: false }); } catch (_) {}

    if (r === 'admin' || isAdmin) {
      try {
        localStorage.setItem(
          'adminUser',
          JSON.stringify({
            name: (profile && (profile.full_name || profile.name)) || 'سوپر ادمین',
            role: 'Super Admin',
            phone: phone || '09',
            loggedAt: Date.now(),
          })
        );
        sessionStorage.setItem('pm_panel', 'admin');
        sessionStorage.setItem('pm_admin_ok', '1');
      } catch (_) {}
      // همیشه با query تا حتی روی /amirshn رفرش واقعی شود
      window.location.href = '/amirshn?panel=1&t=' + Date.now();
      return;
    }

    if (r === 'seller' || isSeller) {
      try {
        sessionStorage.setItem('pm_panel', 'seller');
        if (profile) {
          localStorage.setItem(
            'sellerUser',
            JSON.stringify(Object.assign({}, profile, { phone: phone, loggedAt: Date.now() }))
          );
        }
      } catch (_) {}
      window.location.href = '/seller';
      return;
    }

    try {
      if (profile) {
        localStorage.setItem(
          'buyerUser',
          JSON.stringify(Object.assign({}, profile, { phone: phone, loggedAt: Date.now() }))
        );
      }
    } catch (_) {}
    window.location.href = '/account';
  };


  async function handlePasswordLogin() {
    if (busy) return;
    setBusy(true);
    setMsg('');
    try {
      const phone = String(emailOrPhone || '').replace(/\D/g, '');
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phone || emailOrPhone, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || 'ورود ناموفق');
        return;
      }
      if (data.mfa_required) {
        setSmsPhone(data.phone || phone);
        setView('sms-otp');
        setMsg(data.message || 'کد تأیید دو مرحله‌ای ارسال شد');
        return;
      }
      redirectAfterAuth(data.profile || { role: isAdmin ? 'admin' : role, phone: String(emailOrPhone || smsPhone || '').replace(/\D/g, '') });
    } catch (e) {
      setMsg(e?.message || 'خطا در ورود');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup() {
    if (busy) return;
    const phone = String(signupPhone || '').replace(/\D/g, '');
    if (!/^09\d{9}$/.test(phone)) {
      setMsg('شماره موبایل ۱۱ رقمی با ۰۹ الزامی است');
      return;
    }
    if (!fullName || fullName.trim().length < 2) {
      setMsg('نام را وارد کنید');
      return;
    }
    if (!password || password.length < 6) {
      setMsg('رمز حداقل ۶ کاراکتر باشد');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone,
          email: signupEmail || undefined,
          password,
          fullName: fullName.trim(),
          role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || 'ثبت‌نام ناموفق');
        return;
      }
      redirectAfterAuth(data.profile || { role: isAdmin ? 'admin' : role, phone: String(emailOrPhone || smsPhone || '').replace(/\D/g, '') });
    } catch (e) {
      setMsg(e?.message || 'خطا در ثبت‌نام');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotRequest() {
    if (busy) return;
    const phone = String(emailOrPhone || signupPhone || '').replace(/\D/g, '');
    if (!/^09\d{9}$/.test(phone)) {
      setMsg('شماره موبایل ۱۱ رقمی وارد کنید');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, purpose: 'recovery' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || 'ارسال کد ناموفق');
        return;
      }
      setSmsPhone(phone);
      setForgotStep('code');
      setMsg(data.message || 'کد بازیابی ارسال شد');
    } catch (e) {
      setMsg(e?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotReset() {
    if (busy) return;
    if (resetPassword.length < 6) {
      setMsg('رمز جدید حداقل ۶ کاراکتر باشد');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: smsPhone, code: resetCode, password: resetPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || 'بازیابی ناموفق');
        return;
      }
      setMsg(data.message || 'رمز تغییر کرد');
      setView('signin');
      setForgotStep('phone');
      setPassword('');
      setResetCode('');
      setResetPassword('');
    } catch (e) {
      setMsg(e?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestOtp() {
    if (busy) return;
    const phone = String(smsPhone || '').replace(/\D/g, '');
    if (phone.length < 11) {
      setMsg('شماره موبایل ۱۱ رقمی وارد کنید');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, purpose: 'login', role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setMsg(data?.error || 'ارسال کد ناموفق');
        return;
      }
      setView('sms-otp');
      setMsg(data.message || 'کد ارسال شد');
    } catch (e) {
      setMsg(e?.message || 'خطا در ارسال کد');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(code) {
    if (busy) return { ok: false };
    setBusy(true);
    setMsg('');
    try {
      const phone = String(smsPhone || emailOrPhone || '').replace(/\D/g, '');
      const endpoint = isAdmin ? '/api/auth/mfa/verify' : '/api/auth/otp/verify';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, code, role: isAdmin ? 'admin' : role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const err = data?.error || 'کد نامعتبر است';
        setMsg(err);
        return { ok: false, error: err };
      }
      // قبل از ریدایرکت session را قطعی ذخیره کن
      try {
        if (isAdmin || String(data?.profile?.role || '').toLowerCase() === 'admin') {
          localStorage.setItem(
            'adminUser',
            JSON.stringify({
              name: data?.profile?.full_name || data?.profile?.name || 'سوپر ادمین',
              role: 'Super Admin',
              phone,
              loggedAt: Date.now(),
            })
          );
          sessionStorage.setItem('pm_panel', 'admin');
          sessionStorage.setItem('pm_admin_ok', '1');
        }
      } catch (_) {}
      setTimeout(() => {
        redirectAfterAuth(
          data.profile || {
            role: isAdmin ? 'admin' : role,
            phone,
          }
        );
      }, 400);
      return { ok: true };
    } catch (e) {
      const err = e?.message || 'خطا در تأیید کد';
      setMsg(err);
      return { ok: false, error: err };
    } finally {
      setBusy(false);
    }
  }



        useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setClosed(true);
        forceCloseAuth(onClose);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    let ps = [];
    let raf = 0;
    const make = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });
    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };
    const onResize = () => {
      setSize();
      init();
    };
    window.addEventListener('resize', onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (closed) return null;
  const effectiveView = isAdmin && (view === 'signup' || view === 'forgot') ? 'signin' : view;
  if (isAdmin && (view === 'signup' || view === 'forgot')) {
    /* admin: no signup/forgot in this surface — keep signin */
  }

  const title =
    view === 'signup'
      ? isAdmin
        ? 'ورود ادمین'
        : isSeller
          ? 'ثبت‌نام فروشنده'
          : 'ثبت‌نام'
      : view === 'forgot'
        ? 'بازیابی رمز عبور'
        : view === 'sms-phone'
          ? 'ورود با پیامک'
          : view === 'sms-otp'
            ? 'کد تأیید'
            : isAdmin
              ? 'ورود ادمین'
              : isSeller
                ? 'ورود فروشنده'
                : 'خوش آمدید';

  const subtitle =
    view === 'signup'
      ? isSeller
        ? 'اطلاعات فروشگاه را وارد کنید.'
        : 'برای شروع خرید حساب بسازید.'
      : view === 'forgot'
        ? 'ایمیل یا شماره خود را وارد کنید.'
        : view === 'sms-phone'
          ? 'شماره موبایل خود را وارد کنید تا کد تأیید ارسال شود.'
          : view === 'sms-otp'
            ? 'کد ارسال‌شده را وارد کنید.'
            : isAdmin
              ? 'وارد پنل مدیریت شوید.'
              : isSeller
                ? 'وارد پنل فروشنده شوید و فروشگاه را مدیریت کنید.'
                : 'وارد حساب کاربری شوید و خرید را ادامه دهید.';

  return (
    <section className="fixed inset-0 z-[200] bg-zinc-950 text-zinc-50">
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a;pointer-events:none}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}100%{transform:scaleY(1);opacity:.7}}
        .card-animate{opacity:0;transform:translateY(20px);animation:fadeUp .8s cubic-bezier(.22,.61,.36,1) .35s forwards}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
        input.pm-auth-field, input#sms-phone, input#auth-email, input#auth-password, input#auth-name {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
        }
        input.pm-auth-field::placeholder, input#sms-phone::placeholder, input#auth-email::placeholder {
          color: #71717a !important;
          -webkit-text-fill-color: #71717a !important;
          opacity: 1 !important;
        }
        input.pm-auth-field:-webkit-autofill,
        input#sms-phone:-webkit-autofill {
          -webkit-text-fill-color: #ffffff !important;
          box-shadow: 0 0 0px 1000px #09090b inset !important;
          transition: background-color 9999s ease-out;
        }
        input#sms-phone, input#auth-email, input#auth-password, input#auth-name {
          color: #fff !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
        }
        input#sms-phone::placeholder, input#auth-email::placeholder {
          color: #71717a !important;
          -webkit-text-fill-color: #71717a !important;
        }
        input#sms-phone:-webkit-autofill,
        input#sms-phone:-webkit-autofill:hover,
        input#sms-phone:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff !important;
          transition: background-color 9999s ease-in-out 0s;
          box-shadow: 0 0 0px 1000px #09090b inset !important;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="accent-lines" aria-hidden>
        <div className="hline" /><div className="hline" /><div className="hline" />
        <div className="vline" /><div className="vline" /><div className="vline" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" />

      <button
        type="button"
        onClick={() => {
          setClosed(true);
          forceCloseAuth(onClose);
        }}
        aria-label="بستن"
        className="fixed top-4 left-4 z-[2147483646] h-11 w-11 inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-lg hover:bg-zinc-800 cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => goContact(onContact, onClose)}
        className="fixed top-4 right-4 z-[2147483646] h-11 px-4 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-50 text-sm shadow-lg hover:bg-zinc-800 cursor-pointer"
      >
        <span>تماس با ما</span>
        <ArrowRight className="h-4 w-4 rotate-180" />
      </button>

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2147483645] text-xs tracking-wide text-zinc-400 pointer-events-none">
        {isAdmin ? 'کنسول ادمین' : isSeller ? 'کنسول فروشنده' : 'کنسول خریدار'}
      </div>

      <div className="relative z-10 h-full w-full grid place-items-center px-4 pt-16">
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-zinc-50">{title}</CardTitle>
            <CardDescription className="text-zinc-400">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {msg ? <p className="text-xs text-emerald-400 text-center">{msg}</p> : null}

            {view === 'sms-phone' ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="sms-phone" className="text-zinc-300">شماره تماس</Label>
                  <Input
                    id="sms-phone" className="pm-auth-field bg-zinc-950 border-zinc-800 text-center tracking-widest"
                    type="tel"
                    style={{ color: "#fff", WebkitTextFillColor: "#fff" }}
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="09xxxxxxxxx"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="bg-zinc-950 border-zinc-800 !text-white placeholder:text-zinc-500 text-center tracking-widest caret-white"
                  />
                </div>
                <Button
                  type="button"
                  className="w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                  onClick={() => handleRequestOtp()}
                  disabled={busy}
                >
                  دریافت کد تأیید
                </Button>
                <button type="button" className="text-sm text-zinc-400 hover:text-zinc-200" onClick={() => { setMsg(''); setView('signin'); }}>
                  بازگشت به ورود با رمز
                </button>
              </>
            ) : null}

            {view === 'sms-otp' ? (
              <OTPVerification
                phone={smsPhone}
                length={6}
                onVerified={async (code) => handleVerifyOtp(code)}
                onResend={() => handleRequestOtp()}
                onBack={() => { setMsg(''); setView('sms-phone'); }}
              />
            ) : null}

            {view !== 'sms-phone' && view !== 'sms-otp' ? (
              <>
                {view === 'signup' ? (
                  <div className="grid gap-2">
                    <Label htmlFor="auth-name" className="text-zinc-300">نام کامل</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="auth-name" value={fullName} onChange={(e) => setFullName(e.target.value)} value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ color: "#fff", WebkitTextFillColor: "#fff", caretColor: "#fff" }} type="text" placeholder="نام شما" className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
                    </div>
                  </div>
                ) : null}

                
            {view === 'signup' ? (
              <div className="grid gap-2">
                <Label htmlFor="signup-phone" className="text-zinc-300">شماره تماس *</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="09xxxxxxxxx"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="bg-zinc-950 border-zinc-800 text-white text-center tracking-widest"
                  style={{ color: '#fff', WebkitTextFillColor: '#fff' }}
                />
              </div>
            ) : null}
<div className="grid gap-2">
                  <Label htmlFor="auth-email" className="text-zinc-300">{view === "signup" ? "ایمیل (اختیاری)" : view === "forgot" ? "شماره تماس" : "ایمیل یا شماره تماس"}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="auth-email" value={view === "signup" ? signupEmail : emailOrPhone} onChange={(e) => view === "signup" ? setSignupEmail(e.target.value) : setEmailOrPhone(e.target.value)} value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} style={{ color: "#fff", WebkitTextFillColor: "#fff", caretColor: "#fff" }}
                      type="text"
                      placeholder="09xxxxxxxxx یا email@example.com"
                      className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {view !== 'forgot' ? (
                  <div className="grid gap-2">
                    <Label htmlFor="auth-password" className="text-zinc-300">رمز عبور</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        id="auth-password" value={view === "forgot" && forgotStep === "code" ? resetPassword : password} onChange={(e) => view === "forgot" && forgotStep === "code" ? setResetPassword(e.target.value) : setPassword(e.target.value)} value={password} onChange={(e) => setPassword(e.target.value)} style={{ color: "#fff", WebkitTextFillColor: "#fff", caretColor: "#fff" }}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-zinc-400 hover:text-zinc-200"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ) : null}

                {view === 'signin' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="auth-remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                      <Label htmlFor="auth-remember" className="text-zinc-400">مرا به خاطر بسپار</Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-zinc-300 hover:text-zinc-100"
                      onClick={() => {
                        setMsg('');
                        setView('forgot');
                      }}
                    >
                      فراموشی رمز عبور
                    </button>
                  </div>
                ) : null}

                <Button
                  type="button"
                  className="w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                  onClick={() => {
                    if (view === 'forgot') setMsg('لینک بازیابی به‌زودی فعال می‌شود .');
                    else if (view === 'signup') setMsg('ثبت‌نام به‌زودی به سرور وصل می‌شود .');
                    else { handlePasswordLogin(); return; }
                  }}
                >
                  
            {view === 'forgot' && forgotStep === 'code' ? (
              <>
                <div className="grid gap-2">
                  <Label className="text-zinc-300">کد پیامک</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-zinc-950 border-zinc-800 text-white text-center tracking-widest"
                    style={{ color: '#fff', WebkitTextFillColor: '#fff' }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-300">رمز جدید</Label>
                  <Input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white"
                    style={{ color: '#fff', WebkitTextFillColor: '#fff' }}
                  />
                </div>
              </>
            ) : null}
{view === 'signup' ? 'ثبت‌نام' : view === 'forgot' ? 'ارسال لینک بازیابی' : 'ورود'}
                </Button>

                {view === 'signin' ? (
                  <>
                    <div className="relative">
                      <Separator />
                      <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[11px] tracking-wide text-zinc-500">
                        ورود با:
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50"
                      onClick={() => {
                        setMsg('');
                        setSmsPhone('');
                        setView('sms-phone');
                      }}
                    >
                      ورود با پیامک
                    </Button>
                  </>
                ) : null}
              </>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-3 text-sm text-zinc-400">
            {view === 'signin' && !isAdmin ? (
              <button
                type="button"
                className="text-zinc-200 hover:underline"
                onClick={() => {
                  setMsg('');
                  setView('signup');
                }}
              >
                ثبت‌نام
              </button>
            ) : view === 'signin' && isAdmin ? null : view === 'sms-phone' || view === 'sms-otp' ? null : (
              <button
                type="button"
                className="text-zinc-200 hover:underline"
                onClick={() => {
                  setMsg('');
                  setView('signin');
                }}
              >
                بازگشت به ورود
              </button>
            )}
            <span className="text-[10px] tracking-wide text-zinc-600">pirahanmardane.ir</span>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
