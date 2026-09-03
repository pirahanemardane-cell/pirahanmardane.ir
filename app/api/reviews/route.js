import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

/**
 * GET /api/reviews?product_id=
 * POST /api/reviews { product_id, rating, body, title? }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    if (!productId) {
      return NextResponse.json({ ok: false, error: 'product_id لازم است' }, { status: 400 })
    }
    let db
    try {
      db = createAdminClient()
    } catch {
      const supabase = await createClient()
      db = supabase
    }
    if (!db) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })

    const { data, error } = await db
      .from('reviews')
      .select('id, product_id, user_id, rating, title, body, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json(
      { ok: true, reviews: data || [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    )
  } catch (e) { try { await logCritical('app/api/reviews/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const product_id = body.product_id
    const rating = Number(body.rating)
    const title = String(body.title || '').trim().slice(0, 120)
    const text = String(body.body || body.comment || '').trim().slice(0, 2000)
    if (!product_id) return NextResponse.json({ ok: false, error: 'product_id لازم است' }, { status: 400 })
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: 'امتیاز ۱ تا ۵' }, { status: 400 })
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      admin = supabase
    }

    const row = {
      product_id,
      user_id: user.id,
      rating: Math.round(rating),
      title: title || null,
      body: text || null,
    }
    const { data, error } = await admin.from('reviews').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, review: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
