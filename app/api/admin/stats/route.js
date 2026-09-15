import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin } from '../../../../lib/api/admin-guard'

export async function GET() {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = gate.admin

    const count = async (table, filter) => {
      try {
        let q = admin.from(table).select('id', { count: 'exact', head: true })
        if (filter) q = filter(q)
        const { count: c, error } = await q
        if (error) return 0
        return c ?? 0
      } catch {
        return 0
      }
    }

    const [
      orders,
      paidOrders,
      pendingOrders,
      products,
      pendingProducts,
      sellers,
      pendingSellers,
      buyers,
      ticketsOpen,
      ticketsAll,
    ] = await Promise.all([
      count('orders'),
      count('orders', (q) => q.in('status', ['paid', 'preparing', 'processing', 'shipped', 'delivered'])),
      count('orders', (q) => q.in('status', ['pending', 'pending_payment', 'awaiting_transfer'])),
      count('products'),
      count('products', (q) => q.in('status', ['pending', 'pending_review'])),
      count('sellers'),
      count('sellers', (q) => q.in('status', ['pending', 'pending_review'])),
      count('profiles', (q) => q.or('role.eq.buyer,role.is.null')),
      count('tickets', (q) => q.in('status', ['open', 'pending', 'in_progress'])),
      count('tickets'),
    ])

    let revenue = 0
    let revenue30d = 0
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString()
    try {
      const { data } = await admin
        .from('orders')
        .select('payable, total, status, created_at')
        .in('status', ['paid', 'preparing', 'processing', 'shipped', 'delivered'])
        .limit(5000)
      for (const o of data || []) {
        const v = Number(o.payable ?? o.total ?? 0) || 0
        revenue += v
        if (o.created_at && o.created_at >= since30) revenue30d += v
      }
    } catch (e) {
      try {
        await logCritical('app/api/admin/stats/route.js', e)
      } catch (_) {}
    }

    let payoutPending = 0
    try {
      const { data } = await admin
        .from('seller_payout_requests')
        .select('amount, status')
        .in('status', ['pending', 'approved'])
        .limit(2000)
      for (const r of data || []) payoutPending += Number(r.amount) || 0
    } catch (_) {}

    return NextResponse.json({
      ok: true,
      stats: {
        orders: orders || 0,
        paid_orders: paidOrders || 0,
        pending_orders: pendingOrders || 0,
        products: products || 0,
        pending_products: pendingProducts || 0,
        sellers: sellers || 0,
        pending_sellers: pendingSellers || 0,
        buyers: buyers || 0,
        tickets_open: ticketsOpen || 0,
        tickets_all: ticketsAll || 0,
        revenue,
        revenue_30d: revenue30d,
        payout_pending_amount: payoutPending,
      },
      generated_at: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
