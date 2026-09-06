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
      .filter((p) => p.length === 11 && p.startsWith('09'))
  )
}

export function isAdminPhone(phone) {
  return getAdminPhones().has(normalizeIranMobile(phone))
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
