import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return {
      user: null,
      res: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }),
    }
  }
  return { user, res: null }
}

/** GET — هدایای فعال کاربر */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const { data, error } = await supabase
      .from('buyer_gifts')
      .select('id, title, code, percent, amount, active, expires_at, created_at, used_at, order_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      if (/relation|does not exist|42P01/i.test(error.message || '')) {
        return NextResponse.json({ ok: true, items: [] })
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    const now = Date.now()
    const items = (data || []).map((g) => {
      const expired = g.expires_at ? Date.parse(g.expires_at) < now : false
      const used = !!g.used_at
      return {
        ...g,
        usable: !!g.active && !used && !expired,
        expired,
        used,
      }
    })

    return NextResponse.json({ ok: true, items })
  } catch (e) {
    try {
      await logCritical('app/api/buyer-gifts/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/**
 * POST — مصرف/اعمال هدیه
 * body: { code } یا { id } و اختیاری order_id
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const body = await request.json().catch(() => ({}))
    const code = body.code ? String(body.code).trim() : ''
    const id = body.id || null
    const orderId = body.order_id || null

    const admin = createAdminClient()
    let q = admin.from('buyer_gifts').select('*').eq('user_id', user.id)
    if (id) q = q.eq('id', id)
    else if (code) q = q.eq('code', code)
    else return NextResponse.json({ ok: false, error: 'code یا id لازم است' }, { status: 400 })

    const { data: gift, error } = await q.maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!gift) return NextResponse.json({ ok: false, error: 'هدیه یافت نشد' }, { status: 404 })
    if (!gift.active) return NextResponse.json({ ok: false, error: 'هدیه غیرفعال است' }, { status: 400 })
    if (gift.used_at) return NextResponse.json({ ok: false, error: 'قبلاً مصرف شده' }, { status: 400 })
    if (gift.expires_at && Date.parse(gift.expires_at) < Date.now()) {
      return NextResponse.json({ ok: false, error: 'منقضی شده' }, { status: 400 })
    }

    const { data: updated, error: upErr } = await admin
      .from('buyer_gifts')
      .update({
        used_at: new Date().toISOString(),
        active: false,
        order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gift.id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle()

    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 400 })
    return NextResponse.json({
      ok: true,
      item: updated,
      discount: {
        percent: gift.percent != null ? Number(gift.percent) : null,
        amount: gift.amount != null ? Number(gift.amount) : null,
        code: gift.code,
      },
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
