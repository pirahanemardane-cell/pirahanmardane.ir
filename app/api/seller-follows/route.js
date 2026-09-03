import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

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

/** GET — لیست seller_idهای دنبال‌شده */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const { data, error } = await supabase
      .from('seller_follows')
      .select('seller_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message, ids: [] }, { status: 400 })
    }

    const ids = (data || []).map((r) => r.seller_id).filter(Boolean)
    return NextResponse.json({ ok: true, ids, items: data || [] })
  } catch (e) { try { await logCritical('app/api/seller-follows/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e), ids: [] }, { status: 500 })
  }
}

/** POST { seller_id } — دنبال کردن */
export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const body = await request.json().catch(() => ({}))
    const sellerId = String(body.seller_id || body.sellerId || '').trim()
    if (!sellerId) {
      return NextResponse.json({ ok: false, error: 'seller_id الزامی است' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('seller_follows')
      .upsert(
        { user_id: user.id, seller_id: sellerId },
        { onConflict: 'user_id,seller_id' }
      )
      .select('seller_id, created_at')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, following: true, item: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** DELETE { seller_id } — لغو دنبال */
export async function DELETE(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    let sellerId = ''
    try {
      const body = await request.json().catch(() => ({}))
      sellerId = String(body.seller_id || body.sellerId || '').trim()
    } catch (_) {}
    if (!sellerId) {
      const { searchParams } = new URL(request.url)
      sellerId = String(searchParams.get('seller_id') || searchParams.get('sellerId') || '').trim()
    }
    if (!sellerId) {
      return NextResponse.json({ ok: false, error: 'seller_id الزامی است' }, { status: 400 })
    }

    const { error } = await supabase
      .from('seller_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('seller_id', sellerId)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, following: false })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
