import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin, requireAdminSensitive } from '../../../../lib/api/admin-guard'

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const featured = searchParams.get('featured')

    let q = gate.admin
      .from('reviews')
      .select(`id, product_id, user_id, seller_id, order_id,
         rating, title, body, status, is_featured, is_admin_created,
         display_name, display_avatar_url,
         approved_at, approved_by, created_at, updated_at`)
      .order('created_at', { ascending: false })
      .limit(200)

    if (status && status !== 'all') q = q.eq('status', status)
    if (featured === 'true') q = q.eq('is_featured', true)

    const { data, error } = await q
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    const rows = data || []
    try {
      const sids = [...new Set(rows.map((r) => r.seller_id).filter(Boolean))]
      const uids = [...new Set(rows.map((r) => r.user_id).filter(Boolean))]
      const pids = [...new Set(rows.map((r) => r.product_id).filter(Boolean))]

      const [sellersRes, profilesRes, productsRes] = await Promise.all([
        sids.length ? gate.admin.from('sellers').select('id, shop_name, slug, logo_url').in('id', sids) : Promise.resolve({ data: [] }),
        uids.length ? gate.admin.from('profiles').select('id, full_name, avatar_url, avatar_status, avatar_pending_url').in('id', uids) : Promise.resolve({ data: [] }),
        pids.length ? gate.admin.from('products').select('id, name, title, cover_image').in('id', pids) : Promise.resolve({ data: [] }),
      ])

      const smap = {}, umap = {}, pmap = {}
      for (const s of sellersRes.data || []) smap[s.id] = s
      for (const u of profilesRes.data || []) umap[u.id] = u
      for (const p of productsRes.data || []) pmap[p.id] = p
      for (const r of rows) {
        if (r.seller_id && smap[r.seller_id]) r.sellers = smap[r.seller_id]
        if (r.user_id && umap[r.user_id]) r.profiles = umap[r.user_id]
        if (r.product_id && pmap[r.product_id]) r.products = pmap[r.product_id]
      }
    } catch (_) {}

    return NextResponse.json({ ok: true, reviews: rows, count: rows.length })
  } catch (e) {
    try { await logCritical('app/api/admin/reviews/route.js:GET', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const body = await request.json().catch(() => ({}))
    const rating = Number(body.rating)
    const text = String(body.body || '').trim().slice(0, 2000)
    const title = String(body.title || '').trim().slice(0, 120)
    const display_name = String(body.display_name || '').trim().slice(0, 80)
    const display_avatar_url = String(body.display_avatar_url || '').trim() || null
    let seller_id = body.seller_id || null
    const seller_name = String(body.seller_name || '').trim().slice(0, 120)
    const product_id = body.product_id || null

    // اگر نام فروشنده داده شده و seller_id نیست، از روی نام فروشگاه پیدا کن
    if (!seller_id && seller_name) {
      try {
        const { data: found } = await gate.admin
          .from('sellers')
          .select('id')
          .ilike('shop_name', seller_name)
          .limit(1)
          .maybeSingle()
        if (found?.id) seller_id = found.id
      } catch (_) {}
    }
    const is_featured = !!body.is_featured
    const publish = body.publish !== false

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: 'امتیاز باید بین ۱ تا ۵ باشد' }, { status: 400 })
    }
    if (!text) return NextResponse.json({ ok: false, error: 'متن نظر الزامی است' }, { status: 400 })
    if (!display_name) return NextResponse.json({ ok: false, error: 'نام نمایشی الزامی است' }, { status: 400 })

    const row = {
      product_id, seller_id, user_id: gate.user.id,
      rating: Math.round(rating), title: title || null, body: text,
      status: publish ? 'approved' : 'pending',
      is_featured, is_admin_created: true,
      display_name, display_avatar_url,
      seller_display_name: seller_name || null,
      approved_at: publish ? new Date().toISOString() : null,
      approved_by: publish ? gate.user.id : null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await gate.admin.from('reviews').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, review: data })
  } catch (e) {
    try { await logCritical('app/api/admin/reviews/route.js:POST', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })

    const patch = { updated_at: new Date().toISOString() }
    if (body.status) {
      if (!['pending', 'approved', 'rejected'].includes(body.status)) {
        return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
      }
      patch.status = body.status
      if (body.status === 'approved') {
        patch.approved_at = new Date().toISOString()
        patch.approved_by = gate.user.id
      }
    }
    if (typeof body.is_featured === 'boolean') patch.is_featured = body.is_featured
    if (body.title !== undefined) patch.title = String(body.title || '').trim().slice(0, 120) || null
    if (body.body !== undefined) patch.body = String(body.body || '').trim().slice(0, 2000)
    if (body.display_name !== undefined) patch.display_name = String(body.display_name || '').trim().slice(0, 80) || null
    if (body.display_avatar_url !== undefined) patch.display_avatar_url = String(body.display_avatar_url || '').trim() || null
    if (body.rating !== undefined) {
      const r = Number(body.rating)
      if (Number.isFinite(r) && r >= 1 && r <= 5) patch.rating = Math.round(r)
    }
    if (body.seller_id !== undefined) patch.seller_id = body.seller_id || null
    if (body.product_id !== undefined) patch.product_id = body.product_id || null
    if (body.seller_name !== undefined) {
      const sn = String(body.seller_name || '').trim().slice(0, 120)
      patch.seller_display_name = sn || null
      if (sn && patch.seller_id === undefined) {
        try {
          const { data: found } = await gate.admin
            .from('sellers').select('id').ilike('shop_name', sn).limit(1).maybeSingle()
          if (found?.id) patch.seller_id = found.id
        } catch (_) {}
      }
    }

    const { data, error } = await gate.admin.from('reviews').update(patch).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, review: data })
  } catch (e) {
    try { await logCritical('app/api/admin/reviews/route.js:PATCH', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const gate = await requireAdminSensitive()
    if (gate.error) return gate.error
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const { error } = await gate.admin.from('reviews').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    try { await logCritical('app/api/admin/reviews/route.js:DELETE', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
