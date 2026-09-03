import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

function mapRow(r) {
  if (!r) return null
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    status: r.status,
    active: r.active !== false,
    seller_id: r.seller_id,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    discount_percent: r.discount_percent,
    created_at: r.created_at,
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const all = url.searchParams.get('all') === '1'
    let db
    try {
      db = createAdminClient()
    } catch {
      db = await createClient()
    }
    let q = db.from('campaigns').select('*').order('created_at', { ascending: false }).limit(100)
    if (!all) {
      q = q.eq('active', true).eq('status', 'approved')
    } else {
      const gate = await requireAdmin()
      if (gate.error) return gate.error
      db = gate.admin
      q = db.from('campaigns').select('*').order('created_at', { ascending: false }).limit(100)
    }
    const { data, error } = await q
    if (error) {
      // table may not exist yet
      return NextResponse.json({ ok: true, items: [], note: error.message })
    }
    return NextResponse.json({ ok: true, items: (data || []).map(mapRow) })
  } catch (e) { try { await logCritical('app/api/campaigns/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const title = String(body.title || '').trim()
    if (!title) return NextResponse.json({ ok: false, error: 'عنوان لازم است' }, { status: 400 })
    const row = {
      title,
      body: body.body || null,
      status: body.status || 'approved',
      active: body.active !== false,
      seller_id: body.seller_id || null,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      discount_percent: body.discount_percent != null ? Number(body.discount_percent) : null,
    }
    const { data, error } = await gate.admin.from('campaigns').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, item: mapRow(data) })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const patch = { updated_at: new Date().toISOString() }
    for (const k of ['title', 'body', 'status', 'seller_id', 'starts_at', 'ends_at']) {
      if (body[k] != null) patch[k] = body[k]
    }
    if (body.active != null) patch.active = !!body.active
    if (body.discount_percent != null) patch.discount_percent = Number(body.discount_percent)
    const { data, error } = await gate.admin.from('campaigns').update(patch).eq('id', id).select('*').maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json({ ok: true, item: mapRow(data) })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const { error } = await gate.admin.from('campaigns').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
