import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function PATCH(request, { params }) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const id = params?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const patch = {}
    if (body.code != null) patch.code = String(body.code).trim().toUpperCase()
    if (body.type != null) patch.type = body.type === 'amount' ? 'amount' : 'percent'
    if (body.value != null) patch.value = Math.max(1, parseInt(body.value, 10) || 1)
    if (body.min_cart != null) patch.min_cart = Math.max(0, parseInt(body.min_cart, 10) || 0)
    if (body.max_uses != null) patch.max_uses = body.max_uses === null ? null : parseInt(body.max_uses, 10)
    if (body.active != null) patch.active = !!body.active
    if (body.title != null) patch.title = String(body.title).slice(0, 120)
    if (body.starts_at != null) patch.starts_at = body.starts_at
    if (body.ends_at != null) patch.ends_at = body.ends_at
    if (!Object.keys(patch).length) return NextResponse.json({ ok: false, error: 'فیلدی نیست' }, { status: 400 })
    const { data, error } = await admin.from('coupons').update(patch).eq('id', id).select('*').maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, coupon: data })
  } catch (e) { try { await logCritical('app/api/coupons/[id]/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const id = params?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('coupons').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
