import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const scope = String(body.scope || body.all || '').toLowerCase()
    const global = scope === 'global' || scope === 'all' || body.allDevices === true || body.all === true

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    let userId = null
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch (_) {}

    try {
      await supabase.auth.signOut()
    } catch (_) {}

    // خروج از همه دستگاه‌ها (revocation سراسری)
    if (global && userId) {
      try {
        const admin = createAdminClient()
        // Supabase JS: signOut(userId, scope)
        if (typeof admin.auth.admin.signOut === 'function') {
          await admin.auth.admin.signOut(userId, 'global')
        } else {
          // fallback: invalidate با به‌روز کردن user metadata
          await admin.auth.admin.updateUserById(userId, {
            user_metadata: { force_logout_at: Date.now() },
          })
        }
      } catch (e) {
        console.warn('[logout] global', e?.message || e)
      }
    }

    const res = NextResponse.json({
      ok: true,
      message: global ? 'خروج از همه دستگاه‌ها انجام شد' : 'خروج انجام شد',
      global: !!global,
    })
    const secure = process.env.NODE_ENV === 'production'
    const clear = { path: '/', maxAge: 0, sameSite: 'lax', httpOnly: true, secure }
    try {
      res.cookies.set('pm_admin_since', '', clear)
      res.cookies.set('pm_mfa_pending', '', clear)
      res.cookies.set('pm_device', '', clear)
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
