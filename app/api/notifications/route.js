import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

async function requireUser(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null, res: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  }
  return { user, res: null }
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const { data, error } = await supabase
      .from('user_notifications')
      .select('id, title, body, read, type, meta, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      if (/relation|does not exist|42P01/i.test(error.message || '')) {
        return NextResponse.json({ ok: true, items: [] })
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    const items = (data || []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body || '',
      read: !!n.read,
      type: n.type,
      date: n.created_at ? new Date(n.created_at).toLocaleString('fa-IR') : '',
      created_at: n.created_at,
    }))
    return NextResponse.json({ ok: true, items })
  } catch (e) { try { await logCritical('app/api/notifications/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const body = await request.json().catch(() => ({}))
    if (body.mark_all_read) {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const updates = {}
    if (Object.prototype.hasOwnProperty.call(body, 'read')) updates.read = !!body.read
    if (!Object.keys(updates).length) {
      return NextResponse.json({ ok: false, error: 'فیلدی نیست' }, { status: 400 })
    }
    const { error } = await supabase
      .from('user_notifications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const body = await request.json().catch(() => ({}))
    const id = body.id || new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })

    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
