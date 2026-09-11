import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'

/** GET /api/account/export — خروجی داده کاربر برای خودش */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const admin = createAdminClient()
    const uid = user.id
    const [profile, orders, addresses, tickets] = await Promise.all([
      admin.from('profiles').select('*').eq('id', uid).maybeSingle(),
      admin.from('orders').select('id, order_number, status, total, payable, created_at').eq('user_id', uid).limit(200),
      admin.from('addresses').select('*').eq('user_id', uid).limit(50),
      admin.from('tickets').select('id, subject, status, created_at').eq('user_id', uid).limit(50),
    ])

    const payload = {
      exported_at: new Date().toISOString(),
      user: { id: uid, email: user.email || null },
      profile: profile.data || null,
      orders: orders.data || [],
      addresses: addresses.data || [],
      tickets: tickets.data || [],
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pirahanmardane-export.json"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
