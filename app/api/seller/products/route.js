import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { persistProductImages } from '../../../../lib/product-image-persist'
import { invalidateCatalogCache } from '../../../../lib/catalog-cache'
import { invalidateProductCaches } from '../../../../lib/catalog-cache'

async function sellerIdForUser(admin, userId) {
  const { data: byOwner } = await admin
    .from('sellers')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()
  if (byOwner?.id) return byOwner.id
  try {
    const { data: byUser } = await admin
      .from('sellers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (byUser?.id) return byUser.id
  } catch (_) { try { await logCritical('seller-products', _) } catch (_lc) {} }
  return null
}

/** GET /api/seller/products — محصولات فروشگاه کاربر */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const admin = createAdminClient()
    const sid = await sellerIdForUser(admin, user.id)
    if (!sid) return NextResponse.json({ ok: false, error: 'فروشگاه یافت نشد' }, { status: 404 })

    const { data, error } = await admin
      .from('products')
      .select('id, name, title, slug, base_price, status, cover_image, images, category_id, brand_id, description, payload, product_code, scheduled_publish_at, created_at, updated_at')
      .eq('seller_id', sid)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    invalidateCatalogCache()
    invalidateProductCaches()
    return NextResponse.json({ ok: true, products: data || [], seller_id: sid })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** POST /api/seller/products — ایجاد محصول */
export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const admin = createAdminClient()
    const sid = await sellerIdForUser(admin, user.id)
    if (!sid) return NextResponse.json({ ok: false, error: 'فروشگاه یافت نشد' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    const name = String(body.name || body.title || '').trim()
    if (!name) return NextResponse.json({ ok: false, error: 'نام محصول لازم است' }, { status: 400 })
    const base_price = Number(body.base_price ?? body.price ?? 0)
    // فروشنده حق انتشار مستقیم ندارد — همیشه در انتظار تأیید ادمین
    let status = 'pending'
    if (body.status === 'scheduled' || body.scheduled_publish_at) {
      status = 'draft'
    }
    let scheduled_publish_at = null
    if (body.scheduled_publish_at) {
      const d = new Date(body.scheduled_publish_at)
      if (!Number.isNaN(d.getTime())) {
        scheduled_publish_at = d.toISOString()
        status = 'draft'
      }
    }
    const slug =
      String(body.slug || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') || `p-${Date.now().toString(36)}`

    // تصاویر: فقط WebP → Storage؛ اصل JPG/PNG هرگز در DB ذخیره نمی‌شود
    const rawImages = Array.isArray(body.images)
      ? body.images
      : [body.cover_image || body.image].filter(Boolean)
    const storedImages = await persistProductImages(admin, rawImages, { sellerId: sid })
    const cover = storedImages[0] || null

    const payload = {
      ...(body.payload && typeof body.payload === 'object' ? body.payload : {}),
      name,
      price: Number.isFinite(base_price) ? base_price : 0,
      stock: body.stock != null ? Number(body.stock) : (body.payload?.stock ?? 0),
      category: body.category || body.category_name || body.payload?.category || '',
      categories: body.categories || body.payload?.categories || [],
      brand: body.brand || body.brandName || body.payload?.brand || '',
      brandName: body.brandName || body.brand || body.payload?.brandName || '',
      colors: Array.isArray(body.colors) ? body.colors : (body.payload?.colors || []),
      sizes: Array.isArray(body.sizes) ? body.sizes : (body.payload?.sizes || []),
      tags: Array.isArray(body.tags) ? body.tags : (body.payload?.tags || []),
      attributes: body.attributes || body.payload?.attributes || {},
      variants: body.variants || body.payload?.variants || [],
      desc: body.description || body.desc || body.payload?.desc || '',
      images: storedImages,
      productCode: body.productCode || body.product_code || body.payload?.productCode || ('03' + String(Date.now()).slice(-10)),
      multiVariant: !!body.multiVariant,
      seoTitle: body.seoTitle || '',
      seoDescription: body.seoDescription || '',
      slug: slug,
    }
    const row = {
      name,
      title: name,
      slug,
      base_price: Number.isFinite(base_price) ? base_price : 0,
      status,
      seller_id: sid,
      cover_image: cover,
      images: storedImages,
      scheduled_publish_at,
      description: body.description || body.desc || null,
      product_code: payload.productCode || ('03' + String(Date.now()).slice(-10)),
      payload,
    }
    const { data, error } = await admin.from('products').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    invalidateCatalogCache()
    invalidateProductCaches()
    return NextResponse.json({ ok: true, product: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
