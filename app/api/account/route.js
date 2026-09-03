import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

/**
 * GET /api/account — نمای تجمیعی حساب کاربر واردشده
 * (جایگزین stub 501)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    }
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      admin = supabase
    }

    const uid = user.id

    const [profileRes, ordersRes, addressesRes, ticketsRes, notifRes, wishlistRes] =
      await Promise.all([
        admin.from('profiles').select('id, full_name, phone, email, role, created_at, deleted_at').eq('id', uid).maybeSingle(),
        admin
          .from('orders')
          .select('id, order_number, status, total, payable, created_at, payment_method')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(50),
        admin
          .from('addresses')
          .select('id, title, full_name, phone, province, city, address_line, postal_code, is_default')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(30),
        admin
          .from('tickets')
          .select('id, subject, status, created_at, updated_at')
          .eq('user_id', uid)
          .order('updated_at', { ascending: false })
          .limit(30),
        admin
          .from('user_notifications')
          .select('id, title, body, read, type, created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(40),
        admin
          .from('wishlists')
          .select('id, product_id, created_at')
          .eq('user_id', uid)
          .limit(100),
      ])

    // soft-fail per relation
    const profile = profileRes.data || null
    const orders = ordersRes.error ? [] : ordersRes.data || []
    const addresses = addressesRes.error ? [] : addressesRes.data || []
    const tickets = ticketsRes.error ? [] : ticketsRes.data || []
    const notifications = notifRes.error ? [] : notifRes.data || []
    const wishlist = wishlistRes.error ? [] : wishlistRes.data || []

    return NextResponse.json({
      ok: true,
      user: {
        id: uid,
        email: user.email || profile?.email || null,
        phone: profile?.phone || user.phone || null,
        full_name: profile?.full_name || null,
        role: profile?.role || 'buyer',
        created_at: profile?.created_at || user.created_at,
      },
      orders,
      addresses,
      tickets,
      notifications,
      wishlist,
      counts: {
        orders: orders.length,
        addresses: addresses.length,
        tickets: tickets.length,
        notifications_unread: notifications.filter((n) => !n.read).length,
        wishlist: wishlist.length,
      },
    })
  } catch (e) {
    try {
      await logCritical('app/api/account/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** DELETE /api/account — همان منطق account/delete (confirm در body) */
export async function DELETE(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const confirm = String(body.confirm || '').trim()
    if (confirm !== 'DELETE' && confirm !== 'حذف') {
      return NextResponse.json({ ok: false, error: 'برای تأیید، confirm باید DELETE باشد' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin
      .from('profiles')
      .update({ deleted_at: new Date().toISOString(), full_name: 'حذف‌شده', phone: null })
      .eq('id', user.id)
    await admin.from('sellers').update({ status: 'suspended' }).eq('owner_id', user.id)

    try {
      await admin.auth.admin.updateUserById(user.id, {
        ban_duration: '876000h',
        user_metadata: { deleted: true },
      })
    } catch (_) {}

    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
