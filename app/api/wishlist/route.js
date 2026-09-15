import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

/**
 * GET  /api/wishlist — لیست علاقه‌مندی کاربر لاگین‌شده
 * POST /api/wishlist — افزودن محصول { product_id }
 * DELETE /api/wishlist — حذف { product_id }  (یا ?product_id=)
 */

async function requireUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { user: null, res: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  return { user, res: null }
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const { data, error } = await supabase
      .from('wishlists')
      .select(
        `id, product_id, created_at,
         product:products (
           id, title, slug, base_price, discount_percent, cover_image, status
         )`
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) { try { await logCritical('app/api/wishlist/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const body = await request.json().catch(() => ({}))
    const productId = String(body.product_id || body.productId || '').trim()
    if (!productId) {
      return NextResponse.json({ ok: false, error: 'product_id الزامی است' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('wishlists')
      .upsert(
        { user_id: user.id, product_id: productId },
        { onConflict: 'user_id,product_id' }
      )
      .select('id, product_id, created_at')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: 'به علاقه‌مندی اضافه شد', item: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const { searchParams } = new URL(request.url)
    let productId = searchParams.get('product_id') || searchParams.get('productId')
    if (!productId) {
      const body = await request.json().catch(() => ({}))
      productId = body.product_id || body.productId
    }
    productId = String(productId || '').trim()
    if (!productId) {
      return NextResponse.json({ ok: false, error: 'product_id الزامی است' }, { status: 400 })
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: 'از علاقه‌مندی حذف شد' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
