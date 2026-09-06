import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

/**
 * GET /api/reviews?product_id=...
 * GET /api/reviews?featured=true   → نظرات ویژه صفحه اصلی
 * POST /api/reviews { product_id, rating, body, title? }
 */
function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const featured = searchParams.get('featured')

    let db
    try {
      db = createAdminClient()
    } catch {
      const supabase = await createClient()
      db = supabase
    }
    if (!db) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })

    // ── نظرات ویژه صفحه اصلی ──
    if (featured === 'true') {
      const { data, error } = await db
        .from('reviews')
        .select(`
          id, rating, title, body, display_name, display_avatar_url,
          seller_id, city, is_featured, status, created_at
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) {
        // اگر ستون city نبود، بدون city دوباره امتحان کن
        const retry = await db
          .from('reviews')
          .select(`
            id, rating, title, body, display_name, display_avatar_url,
            seller_id, is_featured, status, created_at
          `)
          .eq('status', 'approved')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(30)
        if (retry.error) {
          return NextResponse.json({ ok: false, error: retry.error.message }, { status: 400 })
        }
        var rows = retry.data || []
      } else {
        var rows = data || []
      }

      // نام فروشنده از جدول sellers
      const sids = [...new Set(rows.map((r) => r.seller_id).filter(Boolean))]
      let smap = {}
      if (sids.length) {
        const { data: sellers } = await db.from('sellers').select('id, shop_name').in('id', sids)
        for (const s of sellers || []) smap[s.id] = s.shop_name
      }

      const reviews = rows.map((r) => ({
        id: r.id,
        name: r.display_name || 'خریدار',
        display_name: r.display_name || 'خریدار',
        image: r.display_avatar_url || '/logo.webp',
        display_avatar_url: r.display_avatar_url || '/logo.webp',
        rating: r.rating || 0,
        text: stripHtml(r.body || r.title || ''),
        body: r.body || '',
        seller_id: r.seller_id || null,
        seller: smap[r.seller_id] || r.seller_name || null,
        city: r.city || '',
      }))

      return NextResponse.json(
        { ok: true, reviews },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
      )
    }

    // ── نظرات یک محصول ──
    if (!productId) {
      return NextResponse.json({ ok: false, error: 'product_id یا featured=true لازم است' }, { status: 400 })
    }

    const { data, error } = await db
      .from('reviews')
      .select('id, product_id, user_id, rating, title, body, display_name, display_avatar_url, status, created_at')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // fallback بدون فیلتر status (اگر ستون نبود)
      const { data: d2, error: e2 } = await db
        .from('reviews')
        .select('id, product_id, user_id, rating, title, body, created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (e2) return NextResponse.json({ ok: false, error: e2.message }, { status: 400 })
      return NextResponse.json(
        { ok: true, reviews: d2 || [] },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
      )
    }
    return NextResponse.json(
      { ok: true, reviews: data || [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    )
  } catch (e) {
    try { await logCritical('app/api/reviews/route.js', e) } catch (_lc) {}
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
      status: 'pending',
    }
    const { data, error } = await admin.from('reviews').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, review: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
