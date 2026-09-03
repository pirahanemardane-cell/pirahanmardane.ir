import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { NextResponse } from 'next/server'

const ADMIN_PHONES = new Set(['09921863063'])

function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '')
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
  const roleOk = ['admin', 'superadmin'].includes(String(profile?.role || '').toLowerCase())
  const phoneOk = ADMIN_PHONES.has(phone)

  if (!roleOk && !phoneOk) {
    return { error: NextResponse.json({ ok: false, error: 'دسترسی ادمین لازم است' }, { status: 403 }) }
  }
  return { user, admin, supabase, profile }
}
