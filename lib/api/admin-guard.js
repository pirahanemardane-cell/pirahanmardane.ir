import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '')
}

function normalizeIranMobile(v) {
  let d = onlyDigits(v)
  if (d.startsWith('0098')) d = d.slice(4)
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2)
  if (d.length === 10 && d.startsWith('9')) d = '0' + d
  return d
}

/** شماره‌های ادمین فقط از env */
export function getAdminPhones() {
  const raw = process.env.ADMIN_PHONES || process.env.ADMIN_ALLOWED_PHONES || ''
  return new Set(
    String(raw)
      .split(/[,\s]+/)
      .map((p) => normalizeIranMobile(p))
      .filter((p) => p.length === 11 && p.startsWith('09')),
  )
}

export function isAdminPhone(phone) {
  return getAdminPhones().has(normalizeIranMobile(phone))
}

/** عمر سشن ادمین در سطح اپ (ثانیه) — پیش‌فرض ۲ ساعت */
export function adminSessionMaxAgeSec() {
  // پیش‌فرض: بدون انقضای عملی (۱۰ سال). برای محدود کردن: ADMIN_SESSION_MAX_AGE_SEC را در Vercel ست کنید.
  const raw = process.env.ADMIN_SESSION_MAX_AGE_SEC
  if (raw === '0' || raw === 'never' || raw === 'NEVER') return 10 * 365 * 24 * 60 * 60
  const n = Number(raw || 10 * 365 * 24 * 60 * 60)
  return Number.isFinite(n) && n > 0 ? n : 10 * 365 * 24 * 60 * 60
}

export async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) {
    return { error: NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 }) }
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return { error: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    admin = supabase
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('id, role, phone, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const phone = normalizeIranMobile(profile?.phone || user.phone || '')
  if (!isAdminPhone(phone)) {
    return { error: NextResponse.json({ ok: false, error: 'دسترسی ادمین لازم است' }, { status: 403 }) }
  }

  const role = String(profile?.role || '').toLowerCase()
  const roleOk = role === 'admin' || role === 'superadmin'
  if (!roleOk) {
    return {
      error: NextResponse.json(
        { ok: false, error: 'نقش ادمین برای این حساب فعال نیست' },
        { status: 403 },
      ),
    }
  }

  // نشست ادمین: بدون انقضای اجباری (فقط شماره ادمین + نقش)
  // کوکی pm_admin_since فقط برای آمار/اختیاری تمدید می‌شود و دیگر دسترسی را قطع نمی‌کند
  try {
    const jar = await cookies()
    jar.set('pm_admin_since', String(Date.now()), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: adminSessionMaxAgeSec(),
    })
  } catch (_) {
    // cookies در دسترس نبود — role+phone کافی است
  }

  // تمدید عمر نشست ادمین با هر درخواست موفق
  try {
    const jar = await cookies()
    jar.set('pm_admin_since', String(Date.now()), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: adminSessionMaxAgeSec(),
    })
  } catch (_) {}

  return {
    user,
    admin,
    supabase,
    profile: profile
      ? { ...profile, role: role === 'superadmin' ? 'superadmin' : 'admin', phone }
      : { role: 'admin', phone },
  }
}
/* pm_admin_since_refresh */

/**
 * برای بک‌آپ / restore:
 * علاوه بر requireAdmin، کوکی pm_admin_reauth باید معتبر باشد (≤ ۱۰ دقیقه)
 */
export async function requireAdminSensitive() {
  const gate = await requireAdmin()
  if (gate.error) return gate

  try {
    const jar = await cookies()
    const token = jar.get('pm_admin_reauth')?.value || ''
    const exp = Number(jar.get('pm_admin_reauth_exp')?.value || 0)
    if (!token || !exp || Date.now() > exp) {
      return {
        error: NextResponse.json(
          {
            ok: false,
            error: 'برای بک‌آپ باید کد تأیید پیامکی را وارد کنید',
            code: 'ADMIN_REAUTH_REQUIRED',
          },
          { status: 403 },
        ),
      }
    }
    // توکن باید با user id هم‌خوان باشد
    if (token !== `ok:${gate.user.id}`) {
      return {
        error: NextResponse.json(
          { ok: false, error: 'تأیید مجدد نامعتبر است', code: 'ADMIN_REAUTH_REQUIRED' },
          { status: 403 },
        ),
      }
    }
  } catch (_) {
    return {
      error: NextResponse.json(
        { ok: false, error: 'بررسی تأیید مجدد ناموفق بود', code: 'ADMIN_REAUTH_REQUIRED' },
        { status: 503 },
      ),
    }
  }

  return gate
}
