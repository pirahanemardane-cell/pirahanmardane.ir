import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import { persistProductImages } from '../../../../../lib/product-image-persist'
import { invalidateCatalogCache } from '../../../../../lib/catalog-cache'
import { invalidateProductCaches } from '../../../../../lib/catalog-cache'

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
  } catch (_) { try { await logCritical('app/api/seller/products/[id]/route.js', _) } catch (_lc) {} }
  return null
}

export async function PATCH(request, { params }) {
  try {
    const id = params?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
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

    const { data: existing } = await admin.from('products').select('id, seller_id').eq('id', id).maybeSingle()
    if (!existing || existing.seller_id !== sid) {
      return NextResponse.json({ ok: false, error: 'محصول یافت نشد' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const patch = {}
    if (body.name != null || body.title != null) {
      patch.name = String(body.name || body.title).trim()
      patch.title = patch.name
    }
    if (body.base_price != null || body.price != null) patch.base_price = Number(body.base_price ?? body.price)
    if (body.status != null) {
      // فروشنده نمی‌تواند خودش active کند؛ حذف دائم فقط با تأیید ادمین (purge_requested)
      const st = String(body.status || '').toLowerCase().trim()
      if (st === 'active') patch.status = 'pending'
      else if (st === 'purge_requested' || st === 'purge-request') patch.status = 'purge_requested'
      else if (st === 'archived') patch.status = 'archived'
      else if (st === 'inactive' || st === 'draft') patch.status = st === 'inactive' ? 'inactive' : 'draft'
      else if (st === 'pending') patch.status = 'pending'
      else patch.status = 'pending'
    }
    if (body.scheduled_publish_at !== undefined) {
      if (body.scheduled_publish_at === null || body.scheduled_publish_at === '') {
        patch.scheduled_publish_at = null
      } else {
        const d = new Date(body.scheduled_publish_at)
        if (!Number.isNaN(d.getTime())) {
          patch.scheduled_publish_at = d.toISOString()
          if (patch.status == null) patch.status = 'draft'
        }
      }
    }
    if (body.description != null) patch.description = body.description
    if (body.slug != null) patch.slug = String(body.slug).trim()
    if (body.productCode != null || body.product_code != null) {
      patch.product_code = body.productCode || body.product_code
    }

    if (body.images != null || body.cover_image != null || body.image != null) {
      const rawImages = Array.isArray(body.images)
        ? body.images
        : [body.cover_image || body.image].filter(Boolean)
      const storedImages = await persistProductImages(admin, rawImages, { sellerId: sid, productId: id })
      patch.images = storedImages
      patch.cover_image = storedImages[0] || null
    }

    const { data: prevRow } = await admin.from('products').select('payload').eq('id', id).maybeSingle()
    const prevPayload = prevRow?.payload && typeof prevRow.payload === 'object' ? prevRow.payload : {}
    const nextPayload = {
      ...prevPayload,
      ...(body.payload && typeof body.payload === 'object' ? body.payload : {}),
    }
    if (body.name != null) nextPayload.name = String(body.name || body.title || '').trim()
    if (body.base_price != null || body.price != null) nextPayload.price = Number(body.base_price ?? body.price)
    if (body.stock != null) nextPayload.stock = Number(body.stock)
    if (body.category != null) nextPayload.category = body.category
    if (body.categories != null) nextPayload.categories = body.categories
    if (body.brand != null || body.brandName != null) {
      nextPayload.brand = body.brand || body.brandName
      nextPayload.brandName = body.brandName || body.brand
    }
    if (body.colors != null) nextPayload.colors = body.colors
    if (body.sizes != null) nextPayload.sizes = body.sizes
    if (body.tags != null) nextPayload.tags = body.tags
    if (body.attributes != null) nextPayload.attributes = body.attributes
    if (body.variants != null) nextPayload.variants = body.variants
    if (body.description != null || body.desc != null) nextPayload.desc = body.description || body.desc
    if (patch.images) nextPayload.images = patch.images
    if (patch.product_code) nextPayload.productCode = patch.product_code
    patch.payload = nextPayload

    const { data, error } = await admin.from('products').update(patch).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    invalidateCatalogCache()
    invalidateProductCaches()
    return NextResponse.json({ ok: true, product: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = params?.id
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

    const { data: existing } = await admin.from('products').select('id, seller_id').eq('id', id).maybeSingle()
    if (!existing || existing.seller_id !== sid) {
      return NextResponse.json({ ok: false, error: 'محصول یافت نشد' }, { status: 404 })
    }

    // soft-delete: آرشیو — حذف دائم فقط بعد از تأیید ادمین
    const { error } = await admin.from('products').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    invalidateCatalogCache()
    invalidateProductCaches()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
