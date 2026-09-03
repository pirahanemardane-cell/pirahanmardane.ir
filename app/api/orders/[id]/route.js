/**
 * app/api/orders/[id]/route.js
 * کپی به: Pirahanemardaneir-pro/app/api/orders/[id]/route.js
 *
 * تغییر نسبت به نسخه قبلی:
 * - روی cancel توسط خریدار → SMS order_rejected (عملیات: لغو)
 */
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

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

export async function GET(_request, { params }) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const id = params?.id
    if (!id) {
      return NextResponse.json({ ok: false, error: 'شناسه سفارش نامعتبر است' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    const isAdmin = profile?.role === 'admin'

    let q = supabase
      .from('orders')
      .select(
        `id, order_number, status, subtotal, shipping_cost, tax, discount, payable, currency,
        coupon_code, shipping_method, payment_method, address_snapshot, contact_snapshot,
        note, tracking_code, paid_at, created_at, updated_at, user_id`
      )
      .eq('id', id)

    if (!isAdmin) q = q.eq('user_id', user.id)

    const { data: order, error } = await q.maybeSingle()
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    if (!order) {
      return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })
    }

    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select(
        `id, product_id, variant_id, seller_id, name, color_name, size, image_url,
        qty, unit_price, line_total`
      )
      .eq('order_id', order.id)

    if (itemsErr) {
      return NextResponse.json({ ok: false, error: itemsErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, order, items: items || [] })
  } catch (e) { try { await logCritical('app/api/orders/[id]/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/**
 * PATCH /api/orders/[id] — لغو سفارش توسط خریدار (فقط pending_payment)
 * body: { action: 'cancel' }
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const id = params?.id
    if (!id) {
      return NextResponse.json({ ok: false, error: 'شناسه سفارش نامعتبر است' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const action = String(body.action || '').trim()
    if (action !== 'cancel') {
      return NextResponse.json({ ok: false, error: 'عملیات نامعتبر است' }, { status: 400 })
    }

    const { data: order, error: findErr } = await supabase
      .from('orders')
      .select('id, status, user_id, order_number')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (findErr) {
      return NextResponse.json({ ok: false, error: findErr.message }, { status: 400 })
    }
    if (!order) {
      return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })
    }

    const cancellable = ['pending_payment', 'pending']
    if (!cancellable.includes(String(order.status))) {
      return NextResponse.json(
        { ok: false, error: 'فقط سفارش در انتظار پرداخت قابل لغو است' },
        { status: 400 }
      )
    }

    const { data: updated, error: upErr } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('user_id', user.id)
      .select('id, order_number, status, updated_at')
      .maybeSingle()

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 400 })
    }

    // SMS لغو به خریدار (بهترین‌تلاش)
    try {
      const admin = createAdminClient()
      const { data: prof } = await admin
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()
      if (prof?.phone) {
        const { smsOrderRejected } = await import('../../../../lib/sms')
        await smsOrderRejected({
          phone: prof.phone,
          buyerName: prof.full_name || 'خریدار',
          orderNumber: order.order_number,
          action: 'لغو',
          reason: body.reason || 'لغو توسط خریدار',
        })
      }
    } catch (_) {}

    return NextResponse.json({ ok: true, message: 'سفارش لغو شد', order: updated })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
