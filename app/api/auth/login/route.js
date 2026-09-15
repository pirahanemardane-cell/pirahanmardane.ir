import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function POST(request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'ایمیل و رمز الزامی است' }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 })
    }

    let profile = null
    if (data.user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone, avatar_url')
        .eq('id', data.user.id)
        .maybeSingle()
      profile = p
    }

    return NextResponse.json({
      ok: true,
      message: 'ورود موفق',
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      profile,
    })
  } catch (e) { try { await logCritical('app/api/auth/login/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
