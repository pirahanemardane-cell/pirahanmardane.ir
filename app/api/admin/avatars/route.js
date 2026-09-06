import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin } from '../../../../lib/api/admin-guard'

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    let q = gate.admin
      .from('profiles')
      .select('id, full_name, phone, avatar_url, avatar_pending_url, avatar_status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100)

    if (status && status !== 'all') q = q.eq('avatar_status', status)

    const { data, error } = await q
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, profiles: data || [] })
  } catch (e) {
    try { await logCritical('app/api/admin/avatars/route.js:GET', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const body = await request.json().catch(() => ({}))
    const userId = body.user_id || body.id
    const action = String(body.action || '').toLowerCase()

    if (!userId) return NextResponse.json({ ok: false, error: 'user_id لازم است' }, { status: 400 })
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'action باید approve یا reject باشد' }, { status: 400 })
    }

    const { data: prof, error: fetchErr } = await gate.admin
      .from('profiles')
      .select('id, avatar_url, avatar_pending_url, avatar_status')
      .eq('id', userId)
      .maybeSingle()

    if (fetchErr || !prof) {
      return NextResponse.json({ ok: false, error: 'پروفایل یافت نشد' }, { status: 404 })
    }

    let patch = { updated_at: new Date().toISOString() }
    if (action === 'approve') {
      const pending = prof.avatar_pending_url
      if (!pending) {
        return NextResponse.json({ ok: false, error: 'تصویر در انتظار وجود ندارد' }, { status: 400 })
      }
      patch.avatar_url = pending
      patch.avatar_pending_url = null
      patch.avatar_status = 'approved'
    } else {
      patch.avatar_pending_url = null
      patch.avatar_status = 'rejected'
    }

    const { data, error } = await gate.admin
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('id, full_name, avatar_url, avatar_pending_url, avatar_status')
      .single()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, profile: data })
  } catch (e) {
    try { await logCritical('app/api/admin/avatars/route.js:PATCH', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
