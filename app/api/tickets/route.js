import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { createTicket, listTicketsForUser, listTicketsForSeller, listAllTickets } from '../../../lib/api/tickets'
import { smsDisputeOpened } from '../../../lib/sms/events'

function isDisputeCategory(cat) {
  const c = String(cat || '').toLowerCase()
  return (
    c.includes('dispute') ||
    c.includes('اختلاف') ||
    c === 'order_dispute' ||
    c === 'complaint'
  )
}

async function notifyDisputeOpened(admin, ticket) {
  if (!ticket?.order_id) return
  try {
    const { data: order } = await admin
      .from('orders')
      .select('id, order_number, user_id')
      .eq('id', ticket.order_id)
      .maybeSingle()
    if (!order) return

    const orderNo = order.order_number || order.id
    const targets = []

    // خریدار
    if (order.user_id) {
      const { data: buyer } = await admin
        .from('profiles')
        .select('phone, full_name')
        .eq('id', order.user_id)
        .maybeSingle()
      if (buyer?.phone) targets.push({ phone: buyer.phone, name: buyer.full_name || 'خریدار' })
    }

    // فروشنده(ها)
    const { data: items } = await admin
      .from('order_items')
      .select('seller_id')
      .eq('order_id', order.id)
    const sellerIds = [...new Set((items || []).map((x) => x.seller_id).filter(Boolean))]
    for (const sid of sellerIds) {
      const { data: sel } = await admin
        .from('sellers')
        .select('shop_name, phone, owner_id')
        .eq('id', sid)
        .maybeSingle()
      if (!sel) continue
      let phone = sel.phone
      let name = sel.shop_name || 'فروشنده'
      if (!phone && sel.owner_id) {
        const { data: prof } = await admin
          .from('profiles')
          .select('phone, full_name')
          .eq('id', sel.owner_id)
          .maybeSingle()
        phone = prof?.phone || phone
        if (!sel.shop_name && prof?.full_name) name = prof.full_name
      }
      if (phone) targets.push({ phone, name })
    }

    const seen = new Set()
    for (const t of targets) {
      if (seen.has(t.phone)) continue
      seen.add(t.phone)
      await smsDisputeOpened({ phone: t.phone, name: t.name, orderNumber: orderNo })
    }
  } catch (e) { try { await logCritical('app/api/tickets/route.js', e) } catch (_lc) {}
    console.warn('[tickets] dispute sms', e?.message || e)
  }
}

export async function GET(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = String(profile?.role || '').toLowerCase()

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || ''

    if (role === 'admin' || role === 'superadmin' || scope === 'admin') {
      if (role !== 'admin' && role !== 'superadmin') {
        return NextResponse.json({ ok: false, error: 'دسترسی ادمین لازم است' }, { status: 403 })
      }
      const { data, error } = await listAllTickets({
        status: searchParams.get('status') || null,
        limit: Number(searchParams.get('limit') || 100),
      })
      if (error) return NextResponse.json({ ok: false, error }, { status: 400 })
      return NextResponse.json({ ok: true, tickets: data || [], role: 'admin' })
    }

    const { data: seller } = await admin
      .from('sellers')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (seller?.id && (scope === 'seller' || scope === '')) {
      const { data: sellerTickets, error: sErr } = await listTicketsForSeller(seller.id, {
        status: searchParams.get('status') || null,
      })
      if (scope === 'seller') {
        if (sErr) return NextResponse.json({ ok: false, error: sErr }, { status: 400 })
        return NextResponse.json({
          ok: true,
          tickets: sellerTickets || [],
          role: 'seller',
          seller_id: seller.id,
        })
      }
      const { data: buyerTickets } = await listTicketsForUser(user.id, {
        status: searchParams.get('status') || null,
      })
      const map = new Map()
      for (const t of [...(buyerTickets || []), ...(sellerTickets || [])]) {
        if (t?.id) map.set(t.id, t)
      }
      return NextResponse.json({
        ok: true,
        tickets: Array.from(map.values()),
        role: 'seller',
        seller_id: seller.id,
      })
    }

    const { data, error } = await listTicketsForUser(user.id, {
      status: searchParams.get('status') || null,
    })
    if (error) return NextResponse.json({ ok: false, error }, { status: 400 })
    return NextResponse.json({ ok: true, tickets: data || [], role: 'buyer' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const subject = String(body.subject || '').trim()
    const text = String(body.body || body.message || '').trim()
    if (!subject || !text) {
      return NextResponse.json({ ok: false, error: 'موضوع و متن الزامی است' }, { status: 400 })
    }

    const category = body.category || 'general'
    const ticket = await createTicket({
      user_id: user.id,
      seller_id: body.seller_id || null,
      order_id: body.order_id || null,
      subject,
      body: text,
      category,
      priority: body.priority || 'normal',
    })
    if (!ticket) return NextResponse.json({ ok: false, error: 'ایجاد تیکت ناموفق' }, { status: 400 })

    // Dispute SMS فقط وقتی دسته اختلاف است و order_id دارد
    if (isDisputeCategory(category) && (ticket.order_id || body.order_id)) {
      try {
        const admin = createAdminClient()
        await notifyDisputeOpened(admin, {
          ...ticket,
          order_id: ticket.order_id || body.order_id,
        })
      } catch (_) {}
    }

    return NextResponse.json({ ok: true, ticket })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
