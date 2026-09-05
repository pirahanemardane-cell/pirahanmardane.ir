import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ ok: true, user: null, profile: null })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
      profile,
    })
  } catch (e) { try { await logCritical('app/api/auth/me/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
