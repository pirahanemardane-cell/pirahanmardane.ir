import { createClient } from '../../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'

/** POST — ثبت امتیاز برای آیتم‌های سفارش تحویل‌شده */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    const orderId = params?.id
    if (!orderId) return NextResponse.json({ ok: false, error: 'شناسه نامعتبر' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const rating = Number(body.rating)
    const comment = String(body.comment || '').trim().slice(0, 1000)
    const productId = body.product_id || body.productId

    if (!productId || !(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ ok: false, error: 'امتیاز ۱ تا ۵ و product_id الزامی است' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!order) return NextResponse.json({ ok: false, error: 'سفارش یافت نشد' }, { status: 404 })
    if (order.status !== 'delivered') {
      return NextResponse.json({ ok: false, error: 'فقط پس از تحویل می‌توانید امتیاز دهید' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .upsert(
        {
          product_id: productId,
          order_id: order.id,
          user_id: user.id,
          rating,
          comment: comment || null,
        },
        { onConflict: 'user_id,product_id,order_id' }
      )
      .select('id, product_id, rating, comment, created_at')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, message: 'امتیاز ثبت شد', review: data })
  } catch (e) { try { await logCritical('app/api/orders/[id]/review/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
