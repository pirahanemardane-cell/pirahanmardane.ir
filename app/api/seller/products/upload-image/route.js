import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import {
  parseImageDataUrl,
  processAndUploadProductImage,
  MAX_IMAGES_PER_PRODUCT,
  MAX_INPUT_BYTES,
} from '../../../../../lib/product-image-persist'

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
  } catch (_) { try { await logCritical('pi/seller/products/upload-image/route.js', _) } catch (_lc) {} }
  return null
}

/**
 * POST /api/seller/products/upload-image
 * Body: { dataUrl, productId?, existingCount? }
 * Flow: auth → seller → limits → Sharp → Storage (R2/Supabase) → { url, thumbUrl }
 */
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
    const existingCount = Number(body.existingCount)
    if (Number.isFinite(existingCount) && existingCount >= MAX_IMAGES_PER_PRODUCT) {
      return NextResponse.json(
        { ok: false, error: `هر محصول حداکثر ${MAX_IMAGES_PER_PRODUCT} تصویر` },
        { status: 400 }
      )
    }

    // If product already in DB, count images
    const productId = body.productId && body.productId !== 'draft' ? String(body.productId) : null
    if (productId) {
      try {
        const { data: prod } = await admin.from('products').select('images, seller_id').eq('id', productId).maybeSingle()
        if (prod && prod.seller_id === sid) {
          const n = Array.isArray(prod.images) ? prod.images.length : 0
          if (n >= MAX_IMAGES_PER_PRODUCT) {
            return NextResponse.json(
              { ok: false, error: `هر محصول حداکثر ${MAX_IMAGES_PER_PRODUCT} تصویر` },
              { status: 400 }
            )
          }
        }
      } catch (_) {}
    }

    const dataUrl = body.dataUrl || body.image || ''
    const parsed = parseImageDataUrl(dataUrl)
    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: 'داده تصویر نامعتبر است (WebP/JPEG/PNG، حداکثر ۲ مگابایت پس از فشرده‌سازی)' },
        { status: 400 }
      )
    }
    if (parsed.buffer.length > MAX_INPUT_BYTES) {
      return NextResponse.json(
        { ok: false, error: `حجم تصویر بیش از ${Math.round(MAX_INPUT_BYTES / 1024)}KB` },
        { status: 400 }
      )
    }

    const result = await processAndUploadProductImage(admin, parsed.buffer, {
      sellerId: sid,
      productId: productId || 'draft',
    })

    return NextResponse.json({
      ok: true,
      url: result.url,
      thumbUrl: result.thumbUrl,
      bytes: result.bytes,
      maxPerProduct: MAX_IMAGES_PER_PRODUCT,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
