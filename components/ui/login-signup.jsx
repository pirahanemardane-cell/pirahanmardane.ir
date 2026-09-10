'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, X, Code2, Globe, User } from 'lucide-react';
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
  const [closed, setClosed] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const canvasRef = useRef(null);
  const isSeller = mode === 'seller';

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

  const title =
    view === 'signup'
      ? isSeller
        ? 'ثبت‌نام فروشنده'
        : 'ثبت‌نام'
      : view === 'forgot'
        ? 'بازیابی رمز عبور'
        : view === 'sms-phone'
          ? 'ورود با پیامک'
          : view === 'sms-otp'
            ? 'کد تأیید'
            : isSeller
              ? 'ورود فروشنده'
              : 'خوش آمدید';

  const subtitle =
    view === 'signup'
      ? isSeller
        ? 'اطلاعات فروشگاه را وارد کنید (ظاهر — منطق بعداً).'
        : 'برای شروع خرید حساب بسازید.'
      : view === 'forgot'
        ? 'ایمیل یا شماره خود را وارد کنید (فعلاً فقط ظاهر).'
        : view === 'sms-phone'
          ? 'شماره موبایل خود را وارد کنید تا کد تأیید ارسال شود.'
          : view === 'sms-otp'
            ? 'کد ارسال‌شده را وارد کنید.'
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
      `}</style>

      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="accent-lines" aria-hidden>
        <div className="hline" /><div className="hline" /><div className="hline" />
        <div className="vline" /><div className="vline" /><div className="vline" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" />

      {/* دکمه‌های fixed — خارج از stacking کارت تا کلیک همیشه برسد */}
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
        {isSeller ? 'کنسول فروشنده' : 'کنسول خریدار'}
      </div>

      <div className="relative z-10 h-full w-full grid place-items-center px-4 pt-16">
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-zinc-50">{title}</CardTitle>
            <CardDescription className="text-zinc-400">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {msg && view !== 'sms-otp' ? <p className="text-xs text-emerald-400 text-center">{msg}</p> : null}

            {view === 'signup' ? (
              <div className="grid gap-2">
                <Label htmlFor="auth-name" className="text-zinc-300">نام کامل</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input id="auth-name" type="text" placeholder="نام شما" className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
                </div>
              </div>
            ) : null}

            {view !== 'sms-phone' && view !== 'sms-otp' ? (
            <div className="grid gap-2">
              <Label htmlFor="auth-email" className="text-zinc-300">ایمیل یا شماره تماس</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input id="auth-email" type="email" placeholder="09xxxxxxxxx یا email@example.com" className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
              </div>
            </div>

            {view !== 'forgot' ? (
              <div className="grid gap-2">
                <Label htmlFor="auth-password" className="text-zinc-300">رمز عبور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="auth-password"
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
                if (view === 'forgot') setMsg('لینک بازیابی به‌زودی فعال می‌شود (فعلاً فقط ظاهر).');
                else if (view === 'signup') setMsg('ثبت‌نام به‌زودی به سرور وصل می‌شود (فعلاً فقط ظاهر).');
                else setMsg('ورود به‌زودی به سرور وصل می‌شود (فعلاً فقط ظاهر).');
              }}
            >
              {view === 'signup' ? 'ثبت‌نام' : view === 'forgot' ? 'Send reset link' : 'Sign in'}
            </Button>

            {view === 'signin' ? (
              <>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[11px] tracking-wide text-zinc-500">ورود با:</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-50"
                  onClick={() => { setMsg(''); setSmsPhone(''); setView('sms-phone'); }}
                >
                  ورود با پیامک
                </Button>
              </>
            ) : null}
          </CardContent>


            ) : null}

            {view === 'sms-phone' ? (
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="sms-phone" className="text-zinc-300">شماره تماس</Label>
                  <Input
                    id="sms-phone"
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="09xxxxxxxxx"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600 text-center tracking-widest"
                  />
                </div>
                <Button
                  type="button"
                  className="w-full h-10 rounded-lg bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                  onClick={() => {
                    if ((smsPhone || '').length < 11) {
                      setMsg('شماره موبایل ۱۱ رقمی وارد کنید');
                      return;
                    }
                    setMsg('');
                    setView('sms-otp');
                  }}
                >
                  دریافت کد تأیید
                </Button>
                <button type="button" className="text-sm text-zinc-400 hover:text-zinc-200" onClick={() => setView('signin')}>
                  بازگشت به ورود با رمز
                </button>
              </div>
            ) : null}

            {view === 'sms-otp' ? (
              <OTPVerification
                phone={smsPhone}
                length={4}
                onVerified={() => setMsg('ورود با پیامک به‌زودی به سرور وصل می‌شود')}
                onResend={() => setMsg('کد مجدداً ارسال می‌شود (ظاهر)')}
                onBack={() => setView('sms-phone')}
              />
            ) : null}

          <CardFooter className="flex flex-col items-center gap-3 text-sm text-zinc-400">
            {view === 'signin' ? (
              <div>
                <button type="button" className="text-zinc-200 hover:underline" onClick={() => { setMsg(''); setView('signup'); }}>
                  ثبت‌نام
                </button>
              </div>
            ) : (
              <button type="button" className="text-zinc-200 hover:underline" onClick={() => { setMsg(''); setView('signin'); }}>
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
