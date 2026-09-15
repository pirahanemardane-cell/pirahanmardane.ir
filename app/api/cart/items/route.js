import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

/**
 * POST   /api/cart/items — افزودن/به‌روزرسانی { product_id, variant_id?, qty }
 * PATCH  /api/cart/items — تغییر تعداد { id یا product_id, qty }
 * DELETE /api/cart/items — حذف { id یا product_id }
 *
 * احراز هویت با client کاربر؛ DB با service_role
 */

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

async function getOrCreateCart(admin, userId) {
  const { data: existing } = await admin
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (existing) return existing

  const { data: created, error } = await admin
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return created
}

async function resolveUnitPrice(admin, productId, variantId) {
  if (variantId) {
    const { data: v } = await admin
      .from('product_variants')
      .select('price, product_id')
      .eq('id', variantId)
      .maybeSingle()
    if (v?.price != null) return Number(v.price)
  }
  const { data: p } = await admin
    .from('products')
    .select('base_price, discount_percent, status')
    .eq('id', productId)
    .maybeSingle()
  if (!p || p.status !== 'active') return null
  const base = Number(p.base_price || 0)
  const disc = Number(p.discount_percent || 0)
  return Math.round(base * (1 - disc / 100))
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
    const variantId = body.variant_id || body.variantId || null
    let qty = parseInt(body.qty ?? body.quantity ?? 1, 10)
    if (!productId) {
      return NextResponse.json({ ok: false, error: 'product_id الزامی است' }, { status: 400 })
    }
    if (!Number.isFinite(qty) || qty < 1) qty = 1
    if (qty > 99) qty = 99

    const admin = createAdminClient()
    const unitPrice = await resolveUnitPrice(admin, productId, variantId)
    if (unitPrice == null) {
      return NextResponse.json({ ok: false, error: 'محصول فعال یافت نشد' }, { status: 400 })
    }

    const cart = await getOrCreateCart(admin, user.id)

    let q = admin
      .from('cart_items')
      .select('id, qty')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
    if (variantId) q = q.eq('variant_id', variantId)
    else q = q.is('variant_id', null)

    const { data: existing } = await q.maybeSingle()

    let item
    if (existing) {
      const newQty = Math.min(99, existing.qty + qty)
      const { data, error } = await admin
        .from('cart_items')
        .update({ qty: newQty, unit_price: unitPrice })
        .eq('id', existing.id)
        .select('id, product_id, variant_id, qty, unit_price')
        .maybeSingle()
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      item = data
    } else {
      const { data, error } = await admin
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
          qty,
          unit_price: unitPrice,
        })
        .select('id, product_id, variant_id, qty, unit_price')
        .maybeSingle()
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      item = data
    }

    await admin.from('carts').update({ updated_at: new Date().toISOString() }).eq('id', cart.id)

    return NextResponse.json({ ok: true, message: 'به سبد اضافه شد', item })
  } catch (e) { try { await logCritical('app/api/cart/items/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { user, res } = await requireUser(supabase)
    if (res) return res

    const body = await request.json().catch(() => ({}))
    const itemId = body.id || body.item_id
    const productId = body.product_id || body.productId
    let qty = parseInt(body.qty ?? body.quantity, 10)

    if (!Number.isFinite(qty) || qty < 1) {
      return NextResponse.json({ ok: false, error: 'qty معتبر نیست' }, { status: 400 })
    }
    if (qty > 99) qty = 99

    const admin = createAdminClient()
    const cart = await getOrCreateCart(admin, user.id)

    let query = admin.from('cart_items').update({ qty }).eq('cart_id', cart.id)
    if (itemId) query = query.eq('id', itemId)
    else if (productId) query = query.eq('product_id', productId)
    else {
      return NextResponse.json({ ok: false, error: 'id یا product_id الزامی است' }, { status: 400 })
    }

    const { data, error } = await query.select('id, product_id, variant_id, qty, unit_price').maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'آیتم یافت نشد' }, { status: 404 })

    await admin.from('carts').update({ updated_at: new Date().toISOString() }).eq('id', cart.id)

    return NextResponse.json({ ok: true, message: 'تعداد به‌روز شد', item: data })
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
    let itemId = searchParams.get('id')
    let productId = searchParams.get('product_id')
    if (!itemId && !productId) {
      const body = await request.json().catch(() => ({}))
      itemId = body.id || body.item_id
      productId = body.product_id || body.productId
    }

    const admin = createAdminClient()
    const cart = await getOrCreateCart(admin, user.id)
    let query = admin.from('cart_items').delete().eq('cart_id', cart.id)
    if (itemId) query = query.eq('id', itemId)
    else if (productId) query = query.eq('product_id', productId)
    else {
      return NextResponse.json({ ok: false, error: 'id یا product_id الزامی است' }, { status: 400 })
    }

    const { error } = await query
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    await admin.from('carts').update({ updated_at: new Date().toISOString() }).eq('id', cart.id)

    return NextResponse.json({ ok: true, message: 'از سبد حذف شد' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
