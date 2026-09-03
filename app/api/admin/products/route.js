import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin } from '../../../../lib/api/admin-guard'

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const limit = Math.min(Number(new URL(request.url).searchParams.get('limit') || 200), 500)
    // بدون embed شکننده sellers(...) — جوین جدا تا یک ستون/رابطه کل لیست را خالی نکند
    const baseSelect =
      'id, name, title, slug, base_price, status, seller_id, cover_image, category_id, brand_id, description, images, payload, product_code, created_at, updated_at'
    let data = null
    let error = null
    {
      const q = await gate.admin
        .from('products')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(limit)
      data = q.data
      error = q.error
    }
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    const rows = data || []
    // غنی‌سازی نام فروشگاه
    try {
      const sids = [...new Set(rows.map((r) => r.seller_id).filter(Boolean))]
      if (sids.length) {
        const { data: sellers } = await gate.admin
          .from('sellers')
          .select('id, shop_name, slug, status')
          .in('id', sids)
        const map = {}
        for (const s of sellers || []) map[s.id] = s
        for (const r of rows) {
          const s = r.seller_id ? map[r.seller_id] : null
          if (s) r.sellers = { id: s.id, shop_name: s.shop_name, slug: s.slug, status: s.status }
        }
      }
    } catch (_) {}
    try {
      const { invalidateCatalogCache } = await import('@/lib/catalog-cache')
      if (typeof invalidateCatalogCache === 'function') invalidateCatalogCache()
    } catch (_) {}
    return NextResponse.json({ ok: true, products: rows, count: rows.length })
  } catch (e) {
    try { await logCritical('app/api/admin/products/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const id = body.id || body.productId
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })

    const patch = { updated_at: new Date().toISOString() }

    if (body.status != null && String(body.status).trim() !== '') {
      let status = String(body.status || '').trim()
      if (status === 'approved') status = 'active'
      if (status === 'rejected') status = 'rejected'
      if (!['active', 'rejected', 'pending', 'inactive', 'draft', 'archived', 'purge_requested'].includes(status)) {
        return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
      }
      patch.status = status
    }

    if (body.name != null) patch.name = String(body.name).trim()
    if (body.title != null) patch.title = String(body.title).trim()
    if (body.slug != null) patch.slug = String(body.slug).trim()
    if (body.description != null) patch.description = String(body.description)
    if (body.cover_image != null || body.image != null) {
      patch.cover_image = String(body.cover_image || body.image || '')
    }
    if (body.base_price != null || body.price != null) {
      const n = Number(body.base_price ?? body.price)
      if (!Number.isNaN(n) && n >= 0) patch.base_price = n
    }
    if (Array.isArray(body.images)) patch.images = body.images

    const needPayload =
      body.stock != null || body.category != null || body.brand != null ||
      body.colors != null || body.sizes != null || body.tags != null ||
      body.attributes != null || body.payload != null

    if (needPayload) {
      const { data: cur } = await gate.admin
        .from('products')
        .select('payload')
        .eq('id', id)
        .maybeSingle()
      const prev = (cur && cur.payload && typeof cur.payload === 'object') ? cur.payload : {}
      const next = { ...prev, ...(body.payload && typeof body.payload === 'object' ? body.payload : {}) }
      if (body.stock != null) next.stock = Number(body.stock) || 0
      if (body.category != null) next.category = String(body.category)
      if (body.brand != null) next.brand = String(body.brand)
      if (body.colors != null) next.colors = body.colors
      if (body.sizes != null) next.sizes = body.sizes
      if (body.tags != null) next.tags = body.tags
      if (body.attributes != null) next.attributes = body.attributes
      patch.payload = next
    }

    if (Object.keys(patch).length <= 1) {
      return NextResponse.json({ ok: false, error: 'هیچ فیلدی برای به‌روزرسانی ارسال نشد' }, { status: 400 })
    }

    const { data, error } = await gate.admin
      .from('products')
      .update(patch)
      .eq('id', id)
      .select('id, name, title, slug, base_price, status, seller_id, cover_image, description, images, payload, product_code, created_at, updated_at')
      .single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    try {
      const { invalidateCatalogCache } = await import('@/lib/catalog-cache')
      if (typeof invalidateCatalogCache === 'function') invalidateCatalogCache()
    } catch (_) {}
    return NextResponse.json({ ok: true, product: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
