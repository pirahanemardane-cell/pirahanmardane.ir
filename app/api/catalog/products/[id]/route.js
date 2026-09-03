import { createClient } from '../../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import { withCatalogCache, cacheKey } from '../../../../../lib/catalog-cache'

export const revalidate = 60

export async function GET(_request, context) {
  try {
    const params = await context.params
    const idOrSlug = params?.id
    if (!idOrSlug) {
      return NextResponse.json({ ok: false, error: 'شناسه محصول الزامی است' }, { status: 400 })
    }
    const key = cacheKey(['catalog', 'product', idOrSlug])
    return await withCatalogCache(key, async () => {
      const supabase = await createClient()
      if (!supabase) {
        return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

      let query = supabase
        .from('products')
        .select(
          `id, title, slug, description, base_price, discount_percent, status, cover_image, images, tags,
           category_id, brand_id, seller_id, created_at, updated_at`
        )
        .eq('status', 'active')

      if (isUuid) query = query.eq('id', idOrSlug)
      else query = query.eq('slug', idOrSlug)

      const { data: product, error } = await query.maybeSingle()

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      }
      if (!product) {
        return NextResponse.json({ ok: false, error: 'محصول پیدا نشد' }, { status: 404 })
      }

      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, color_name, color_hex, size, sku, stock, price_override, image_url')
        .eq('product_id', product.id)

      return NextResponse.json(
        {
          ok: true,
          product,
          variants: variants || [],
        },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
      )
    })
  } catch (e) {
    try {
      await logCritical('catalog/products/[id]', e)
    } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
