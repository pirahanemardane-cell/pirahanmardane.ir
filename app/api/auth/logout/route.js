import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function POST() {
  try {
    const supabase = await createClient()
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (_) {}
    }
    const res = NextResponse.json({ ok: true, message: 'خروج انجام شد' })
    const secure = process.env.NODE_ENV === 'production'
    const clear = { path: '/', maxAge: 0, sameSite: 'lax', httpOnly: true, secure }
    try {
      res.cookies.set('pm_admin_since', '', clear)
      res.cookies.set('pm_mfa_pending', '', clear)
      res.cookies.set('pm_device', '', { ...clear, httpOnly: true })
      res.cookies.set('pm_remember', '', { path: '/', maxAge: 0, sameSite: 'lax', httpOnly: false, secure })
    } catch (_) {}
    return res
  } catch (e) {
    try {
      await logCritical('app/api/auth/logout/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
