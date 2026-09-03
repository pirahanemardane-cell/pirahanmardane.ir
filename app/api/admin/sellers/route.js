import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin } from '../../../../lib/api/admin-guard'

export async function GET() {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    let sellers = []
    let lastErr = null
    const tries = [
      'id, shop_name, slug, status, owner_id, about, city, address, phone, sheba, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status, rating, rating_count, created_at, updated_at',
      'id, shop_name, slug, status, owner_id, phone, city, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status, created_at',
      '*',
    ]
    for (const cols of tries) {
      const q = await gate.admin.from('sellers').select(cols).order('created_at', { ascending: false }).limit(500)
      if (!q.error) {
        sellers = q.data || []
        lastErr = null
        break
      }
      lastErr = q.error
    }
    if (lastErr) {
      return NextResponse.json({ ok: false, error: lastErr.message }, { status: 400 })
    }

    try {
      const ids = sellers.map((s) => s.id).filter(Boolean)
      if (ids.length) {
        const { data: prows } = await gate.admin
          .from('products')
          .select('id, seller_id, status')
          .in('seller_id', ids)
        const countMap = {}, activeMap = {}
        for (const pr of prows || []) {
          countMap[pr.seller_id] = (countMap[pr.seller_id] || 0) + 1
          if (pr.status === 'active') activeMap[pr.seller_id] = (activeMap[pr.seller_id] || 0) + 1
        }
        for (const s of sellers) {
          s.products_count = countMap[s.id] || 0
          s.active_products_count = activeMap[s.id] || 0
        }
      }
    } catch (_) { try { await logCritical('app/api/admin/sellers/route.js', _) } catch (_lc) {} }

    return NextResponse.json({ ok: true, sellers, count: sellers.length })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const id = String(body.id || body.seller_id || '').trim()
    const status = String(body.status || '').trim()
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const normalizedStatus = status === 'blocked' ? 'suspended' : status
    if (!['pending', 'approved', 'rejected', 'suspended', 'archived'].includes(normalizedStatus)) {
      return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
    }
    const statusFinal = normalizedStatus
    const { data, error } = await gate.admin
      .from('sellers')
      .update({ status: statusFinal, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, shop_name, slug, status, owner_id, created_at')
      .maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, seller: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
