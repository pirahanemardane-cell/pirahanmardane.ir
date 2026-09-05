import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { NextResponse } from 'next/server'

function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '')
}

/** شماره‌های ادمین: ADMIN_PHONES=0912...,0992... یا پیش‌فرض امن */
export function getAdminPhones() {
  const raw = process.env.ADMIN_PHONES || process.env.ADMIN_ALLOWED_PHONES || '09921863063'
  return new Set(
    String(raw)
      .split(/[,\s]+/)
      .map((p) => onlyDigits(p))
      .filter((p) => p.length >= 10)
  )
}

export function isAdminPhone(phone) {
  return getAdminPhones().has(onlyDigits(phone))
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
    .select('role, phone')
    .eq('id', user.id)
    .maybeSingle()

  const phone = onlyDigits(profile?.phone || user.phone || '')
  const phoneOk = isAdminPhone(phone)
  // نقش admin فقط وقتی معتبر است که شماره هم در whitelist باشد
  const roleClaim = ['admin', 'superadmin'].includes(String(profile?.role || '').toLowerCase())
  if (!phoneOk) {
    return { error: NextResponse.json({ ok: false, error: 'دسترسی ادمین لازم است' }, { status: 403 }) }
  }
  // اگر نقش هنوز admin نیست ولی شماره whitelist است، همخوان کن
  if (phoneOk && !roleClaim && profile) {
    try {
      await admin
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id)
    } catch (_) {}
  }
  return { user, admin, supabase, profile: profile ? { ...profile, role: 'admin', phone } : profile }
}
