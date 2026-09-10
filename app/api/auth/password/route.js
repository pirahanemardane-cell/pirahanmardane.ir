import { logCritical } from '@/lib/critical-log';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { smsPasswordChanged } from '@/lib/sms/events'

export const dynamic = 'force-dynamic';

function normalizePhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2);
  if (d.length === 10 && d.startsWith('9')) d = '0' + d;
  return d;
}

function phoneEmail(phone0) {
  return `u${normalizePhone(phone0)}@otp.local`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body?.password || '');
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'رمز حداقل ۶ کاراکتر باشد' }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 });
    }

    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (uErr || !user) {
      return NextResponse.json({ ok: false, error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    let phone = user.phone || user.user_metadata?.phone || '';
    try {
      const { data: prof } = await supabase.from('profiles').select('phone').eq('id', user.id).maybeSingle();
      if (prof?.phone) phone = prof.phone;
    } catch (_) {}
    phone = normalizePhone(phone);

    // مسیر اصلی: service role — رمز + ایمیل استاندارد OTP (یکسان برای همه پنل‌ها)
    try {
      const admin = createAdminClient();
      const email = phone ? phoneEmail(phone) : (user.email || undefined);
      const payload = {
        password,
        email_confirm: true,
        user_metadata: {
          ...(user.user_metadata || {}),
          has_user_password: true,
          phone: phone || user.user_metadata?.phone || '',
        },
      };
      if (email) payload.email = email;
      const { error: adminErr } = await admin.auth.admin.updateUserById(user.id, payload);
      if (adminErr) {
        // fallback: فقط رمز روی session فعلی
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          return NextResponse.json({ ok: false, error: adminErr.message || error.message || 'خطا در ذخیره رمز' }, { status: 400 });
        }
      }
    } catch (e) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return NextResponse.json({ ok: false, error: error.message || 'خطا در ذخیره رمز' }, { status: 400 });
      }
      console.warn('[auth/password] admin sync failed', e?.message || e);
    }

    try {
      const name = user.user_metadata?.full_name || user.user_metadata?.name || 'کاربر'
      if (phone) await smsPasswordChanged(phone, name)
    } catch (_) {}
    return NextResponse.json({ ok: true, message: 'رمز ذخیره شد. از این به بعد می‌توانید با همان شماره و رمز وارد شوید.' });
  } catch (e) {
    try {
      await logCritical('auth/password', e);
    } catch (_lc) {}
    return NextResponse.json({ ok: false, error: e?.message || 'server error' }, { status: 500 });
  }
}
