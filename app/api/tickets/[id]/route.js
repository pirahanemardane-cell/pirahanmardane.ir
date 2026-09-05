import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { getTicket, setTicketStatus } from '../../../../lib/api/tickets'
import { smsDisputeActionNeeded, smsDisputeResolved } from '../../../../lib/sms/events'

async function canAccessTicket(admin, user, ticket) {
  if (!user || !ticket) return false
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = String(profile?.role || '').toLowerCase()
  if (role === 'admin' || role === 'superadmin') return true
  if (String(ticket.user_id) === String(user.id)) return true
  if (ticket.seller_id) {
    const { data: seller } = await admin
      .from('sellers')
      .select('id')
      .eq('id', ticket.seller_id)
      .eq('owner_id', user.id)
      .maybeSingle()
    if (seller) return true
  }
  return false
}

function isDisputeTicket(ticket) {
  const c = String(ticket?.category || '').toLowerCase()
  return (
    c.includes('dispute') ||
    c.includes('اختلاف') ||
    c === 'order_dispute' ||
    c === 'complaint'
  )
}

async function notifyDisputeStatus(admin, ticket, status) {
  if (!ticket?.order_id || !isDisputeTicket(ticket)) return
  try {
    const { data: order } = await admin
      .from('orders')
      .select('id, order_number, user_id')
      .eq('id', ticket.order_id)
      .maybeSingle()
    if (!order) return
    const orderNo = order.order_number || order.id

    const targets = []
    if (order.user_id) {
      const { data: buyer } = await admin
        .from('profiles')
        .select('phone, full_name')
        .eq('id', order.user_id)
        .maybeSingle()
      if (buyer?.phone) targets.push({ phone: buyer.phone, name: buyer.full_name || 'خریدار' })
    }
    if (ticket.seller_id) {
      const { data: sel } = await admin
        .from('sellers')
        .select('shop_name, phone, owner_id')
        .eq('id', ticket.seller_id)
        .maybeSingle()
      if (sel) {
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
    }

    const st = String(status || '').toLowerCase()
    const seen = new Set()
    for (const t of targets) {
      if (seen.has(t.phone)) continue
      seen.add(t.phone)
      if (st === 'resolved' || st === 'closed' || st === 'done') {
        await smsDisputeResolved({
          phone: t.phone,
          name: t.name,
          orderNumber: orderNo,
          result: st === 'closed' ? 'بسته شد' : 'حل شد',
        })
      } else if (st === 'pending_user' || st === 'action_required' || st === 'waiting') {
        await smsDisputeActionNeeded({
          phone: t.phone,
          name: t.name,
          orderNumber: orderNo,
        })
      }
    }
  } catch (e) { try { await logCritical('app/api/tickets/[id]/route.js', e) } catch (_lc) {}
    console.warn('[tickets/id] dispute sms', e?.message || e)
  }
}

export async function GET(_request, { params }) {
  try {
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const ticket = await getTicket(id)
    if (!ticket) return NextResponse.json({ ok: false, error: 'تیکت یافت نشد' }, { status: 404 })

    const admin = createAdminClient()
    if (!(await canAccessTicket(admin, user, ticket))) {
      return NextResponse.json({ ok: false, error: 'دسترسی ندارید' }, { status: 403 })
    }
    return NextResponse.json({ ok: true, ticket })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const ticket = await getTicket(id)
    if (!ticket) return NextResponse.json({ ok: false, error: 'تیکت یافت نشد' }, { status: 404 })

    const admin = createAdminClient()
    if (!(await canAccessTicket(admin, user, ticket))) {
      return NextResponse.json({ ok: false, error: 'دسترسی ندارید' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    if (body.status) {
      const res = await setTicketStatus(id, body.status, { admin })
      if (res.error) return NextResponse.json({ ok: false, error: res.error }, { status: 400 })
      try {
        await notifyDisputeStatus(admin, ticket, body.status)
      } catch (_) {}
      return NextResponse.json({ ok: true, ticket: res.data })
    }
    return NextResponse.json({ ok: false, error: 'فیلد قابل به‌روزرسانی ارسال نشد' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
