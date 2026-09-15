import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

/** POST — soft-delete profile + sign out; optional hard delete auth user via service role */
export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const confirm = String(body.confirm || '').trim()
    if (confirm !== 'DELETE' && confirm !== 'حذف') {
      return NextResponse.json({ ok: false, error: 'برای تأیید، confirm باید DELETE باشد' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin
      .from('profiles')
      .update({ deleted_at: new Date().toISOString(), full_name: 'حذف‌شده', phone: null })
      .eq('id', user.id)

    // disable sellers owned by user
    await admin.from('sellers').update({ status: 'suspended' }).eq('owner_id', user.id)

    try {
      await admin.auth.admin.updateUserById(user.id, {
        ban_duration: '876000h',
        user_metadata: { deleted: true },
      })
    } catch (_) { try { await logCritical('app/api/account/delete/route.js', _) } catch (_lc) {} }

    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
