import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { getTicket, addTicketMessage, updateTicketMessage } from '../../../../../lib/api/tickets'

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

export async function POST(request, { params }) {
  try {
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const ticket = await getTicket(id)
    if (!ticket) return NextResponse.json({ ok: false, error: 'تیکت یافت نشد' }, { status: 404 })
    if (String(ticket.status || '').toLowerCase() === 'closed') {
      return NextResponse.json({ ok: false, error: 'تیکت بسته است' }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!(await canAccessTicket(admin, user, ticket))) {
      return NextResponse.json({ ok: false, error: 'دسترسی ندارید' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const text = String(body.body || body.message || '').trim()
    if (!text) return NextResponse.json({ ok: false, error: 'متن پیام خالی است' }, { status: 400 })

    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = String(profile?.role || 'buyer').toLowerCase()
    let senderRole = 'buyer'
    if (role === 'admin' || role === 'superadmin') senderRole = 'admin'
    else if (ticket.seller_id) {
      const { data: seller } = await admin
        .from('sellers')
        .select('id')
        .eq('id', ticket.seller_id)
        .eq('owner_id', user.id)
        .maybeSingle()
      if (seller) senderRole = 'seller'
    }

    const msg = await addTicketMessage({
      ticket_id: id,
      sender_id: user.id,
      sender_role: senderRole,
      body: text,
    })
    if (!msg) return NextResponse.json({ ok: false, error: 'ارسال ناموفق' }, { status: 400 })
    return NextResponse.json({ ok: true, message: msg })
  } catch (e) { try { await logCritical('app/api/tickets/[id]/messages/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const ticketId = params?.id || (await params)?.id
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const messageId = body.message_id || body.id
    const text = body.body || body.message
    if (!messageId) return NextResponse.json({ ok: false, error: 'message_id لازم است' }, { status: 400 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const asAdmin = ['admin', 'superadmin'].includes(String(profile?.role || '').toLowerCase())

    const res = await updateTicketMessage(messageId, user.id, text, { asAdmin, admin })
    if (res.error) return NextResponse.json({ ok: false, error: res.error }, { status: 400 })
    return NextResponse.json({ ok: true, message: res.data, ticket_id: ticketId })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
