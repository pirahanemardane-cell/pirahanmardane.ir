'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, X, Code2, Globe, User } from 'lucide-react';

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

export default function LoginCardSection({ mode = 'buyer', onClose, onContact }) {
  const [view, setView] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState('');
  const canvasRef = useRef(null);
  const isSeller = mode === 'seller';

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

  const title =
    view === 'signup'
      ? isSeller
        ? 'ثبت‌نام فروشنده'
        : 'Create account'
      : view === 'forgot'
        ? 'Reset password'
        : isSeller
          ? 'ورود فروشنده'
          : 'Welcome back';

  const subtitle =
    view === 'signup'
      ? isSeller
        ? 'اطلاعات فروشگاه را وارد کنید (ظاهر — منطق بعداً).'
        : 'Create your account to start shopping.'
      : view === 'forgot'
        ? 'Enter your email and we will send a reset link (UI only for now).'
        : isSeller
          ? 'وارد پنل فروشنده شوید و فروشگاه را مدیریت کنید.'
          : 'Sign in to your account and continue shopping.';

  return (
    <section className="fixed inset-0 z-[200] bg-zinc-950 text-zinc-50">
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a}
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
      <div className="accent-lines">
        <div className="hline" /><div className="hline" /><div className="hline" />
        <div className="vline" /><div className="vline" /><div className="vline" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" />

      <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 z-20" dir="rtl">
        <span className="text-xs tracking-wide text-zinc-400">
          {isSeller ? 'کنسول فروشنده' : 'کنسول خریدار'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                if (typeof onContact === 'function') onContact();
                else if (typeof onClose === 'function') onClose();
              } catch (_) {}
            }}
            className="h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-50 text-sm hover:bg-zinc-900/80"
          >
            <span>تماس با ما</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                if (typeof onClose === 'function') onClose();
              } catch (_) {}
            }}
            aria-label="بستن"
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white relative z-30 pointer-events-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="h-full w-full grid place-items-center px-4 relative z-10">
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-zinc-50">{title}</CardTitle>
            <CardDescription className="text-zinc-400">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            {msg ? <p className="text-xs text-emerald-400 text-center">{msg}</p> : null}

            {view === 'signup' ? (
              <div className="grid gap-2">
                <Label htmlFor="auth-name" className="text-zinc-300">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input id="auth-name" type="text" placeholder="Your name" className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="auth-email" className="text-zinc-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input id="auth-email" type="email" placeholder="you@company.com" className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
              </div>
            </div>

            {view !== 'forgot' ? (
              <div className="grid gap-2">
                <Label htmlFor="auth-password" className="text-zinc-300">Password</Label>
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
                  <Label htmlFor="auth-remember" className="text-zinc-400">Remember me</Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-zinc-300 hover:text-zinc-100"
                  onClick={() => {
                    setMsg('');
                    setView('forgot');
                  }}
                >
                  Forgot password?
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
              {view === 'signup' ? 'Create account' : view === 'forgot' ? 'Send reset link' : 'Sign in'}
            </Button>

            {view === 'signin' ? (
              <>
                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[11px] uppercase tracking-widest text-zinc-500">or</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10 rounded-lg border-zinc-800 bg-zinc-950">
                    <Code2 className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="h-10 rounded-lg border-zinc-800 bg-zinc-950">
                    <Globe className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-3 text-sm text-zinc-400">
            {view === 'signin' ? (
              <div>
                New here?
                <button type="button" className="ml-1 text-zinc-200 hover:underline" onClick={() => { setMsg(''); setView('signup'); }}>
                  Create account
                </button>
              </div>
            ) : (
              <button type="button" className="text-zinc-200 hover:underline" onClick={() => { setMsg(''); setView('signin'); }}>
                Back to sign in
              </button>
            )}
            <span className="text-[10px] tracking-wide text-zinc-600">pirahanmardane.ir</span>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
