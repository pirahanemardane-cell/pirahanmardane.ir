import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

async function requireUser(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, res: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  return { user, res: null }
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res
    const { data, error } = await supabase
      .from('product_views')
      .select('product_id, viewed_at, product:products ( id, title, cover_image, base_price, status )')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(40)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) { try { await logCritical('app/api/recent-views/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { user, res } = await requireUser(supabase)
    if (res) return res
    const body = await request.json().catch(() => ({}))
    const productId = String(body.product_id || body.productId || '').trim()
    if (!productId) return NextResponse.json({ ok: false, error: 'product_id الزامی است' }, { status: 400 })
    const { error } = await supabase.from('product_views').upsert(
      { user_id: user.id, product_id: productId, viewed_at: new Date().toISOString() },
      { onConflict: 'user_id,product_id' },
    )
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
