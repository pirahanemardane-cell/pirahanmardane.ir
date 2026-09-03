import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

function dbClient() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

export async function GET() {
  try {
    let db = dbClient()
    if (!db) db = await createClient()
    if (!db) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })

    const { data, error } = await db
      .from('shipping_methods')
      .select('id, code, title, price, eta, enabled, sort_order')
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) { try { await logCritical('app/api/shipping-methods/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const items = Array.isArray(body.items) ? body.items : body.id || body.code ? [body] : null
    if (!items?.length) return NextResponse.json({ ok: false, error: 'items لازم است' }, { status: 400 })

    const out = []
    for (let i = 0; i < items.length; i++) {
      const m = items[i]
      const payload = {
        code: String(m.code || m.id || `ship-${i}-${Date.now()}`).slice(0, 64),
        title: String(m.title || m.name || 'ارسال').slice(0, 120),
        price: Math.max(0, parseInt(m.price, 10) || 0),
        eta: m.eta != null ? String(m.eta).slice(0, 80) : null,
        enabled: m.enabled !== false,
        sort_order: parseInt(m.sort_order ?? i, 10) || 0,
        updated_at: new Date().toISOString(),
      }
      if (m.id && String(m.id).match(/^[0-9a-f-]{36}$/i)) payload.id = m.id
      const { data, error } = await admin
        .from('shipping_methods')
        .upsert(payload, { onConflict: 'code' })
        .select('id, code, title, price, eta, enabled, sort_order')
        .maybeSingle()
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      if (data) out.push(data)
    }
    return NextResponse.json({ ok: true, items: out })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const id = body.id || new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const { error } = await admin.from('shipping_methods').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
