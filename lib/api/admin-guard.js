import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { NextResponse } from 'next/server'

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

/** شماره‌های ادمین فقط از env: ADMIN_PHONES=0992...,0912... */
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

/**
 * گارد ادمین:
 * - باید لاگین باشد
 * - شماره پروفایل/یوزر باید در ADMIN_PHONES باشد
 * - role در DB باید admin|superadmin باشد
 * - دیگر role را خودکار ارتقا نمی‌دهد (ضد privilege escalation)
 *
 * برای اولین راه‌اندازی فقط اگر ADMIN_BOOTSTRAP_ROLE=1 باشد
 * و شماره whitelist باشد، یک‌بار role را admin می‌کند.
 */
export async function requireAdmin(options = {}) {
  const { allowBootstrap = false } = options
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
  const phoneOk = isAdminPhone(phone)
  if (!phoneOk) {
    return { error: NextResponse.json({ ok: false, error: 'دسترسی ادمین لازم است' }, { status: 403 }) }
  }

  let role = String(profile?.role || '').toLowerCase()
  let roleOk = role === 'admin' || role === 'superadmin'

  // فقط bootstrap صریح از env — نه در هر درخواست
  const bootstrapEnv =
    String(process.env.ADMIN_BOOTSTRAP_ROLE || '').toLowerCase() === '1' ||
    String(process.env.ADMIN_BOOTSTRAP_ROLE || '').toLowerCase() === 'true'

  if (!roleOk && allowBootstrap && bootstrapEnv && profile?.id) {
    try {
      await admin
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id)
      role = 'admin'
      roleOk = true
    } catch (_) {}
  }

  if (!roleOk) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          error:
            'نقش ادمین برای این حساب فعال نیست. یک‌بار با role=admin وارد شوید یا ADMIN_BOOTSTRAP_ROLE را موقتاً روشن کنید.',
        },
        { status: 403 },
      ),
    }
  }

  return {
    user,
    admin,
    supabase,
    profile: profile
      ? { ...profile, role: role === 'superadmin' ? 'superadmin' : 'admin', phone }
      : { role: 'admin', phone },
  }
}

/** گارد سخت‌تر برای بک‌آپ / restore — علاوه بر ادمین، تأیید اخیر OTP لازم است */
export async function requireAdminSensitive() {
  const gate = await requireAdmin()
  if (gate.error) return gate

  // تأیید «ورود اخیر ادمین» از جدول login_otps (نقش verified_session یا admin_reauth)
  try {
    const phone = normalizeIranMobile(gate.profile?.phone || gate.user?.phone || '')
    if (!phone) {
      return {
        error: NextResponse.json(
          { ok: false, error: 'برای این عملیات تأیید دوباره لازم است' },
          { status: 403 },
        ),
      }
    }
    const { data: rows } = await gate.admin
      .from('login_otps')
      .select('id, role, expires_at, consumed_at, created_at')
      .eq('phone', phone)
      .in('role', ['verified_session', 'admin_reauth'])
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(3)

    const now = Date.now()
    // حداکثر ۱۵ دقیقه برای عملیات حساس
    const ok = (rows || []).some((r) => {
      if (!r.expires_at) return false
      const exp = new Date(r.expires_at).getTime()
      const created = r.created_at ? new Date(r.created_at).getTime() : 0
      return exp >= now && now - created <= 15 * 60 * 1000
    })

    if (!ok) {
      return {
        error: NextResponse.json(
          {
            ok: false,
            error: 'برای بک‌آپ/بازگردانی باید حداکثر ۱۵ دقیقه پیش با OTP وارد شده باشید',
            code: 'ADMIN_REAUTH_REQUIRED',
          },
          { status: 403 },
        ),
      }
    }
  } catch (_) {
    // اگر جدول در دسترس نبود، فقط requireAdmin کافی است (fail-open نکن — fail-closed)
    return {
      error: NextResponse.json(
        { ok: false, error: 'بررسی تأیید مجدد ناموفق بود' },
        { status: 503 },
      ),
    }
  }

  return gate
}
