import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import { writeAdminAudit } from '../../../../../lib/api/audit-log'
import { notifyUser } from '../../../../../lib/api/notify'

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return { error: NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 }) }
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return { error: NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 }) }
  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('id, role').eq('id', user.id).maybeSingle()
  const role = String(profile?.role || '').toLowerCase()
  if (role !== 'admin' && role !== 'superadmin') {
    return { error: NextResponse.json({ ok: false, error: 'فقط ادمین' }, { status: 403 }) }
  }
  return { admin }
}

/** PATCH /api/admin/products/[id] — تأیید / رد / بایگانی محصول */
export async function PATCH(request, { params }) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const { admin } = gate
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    let status = String(body.status || '').toLowerCase().trim()
    // UI ممکن است approved / publish بفرستد
    if (status === 'approved' || status === 'publish' || status === 'published') status = 'active'
    if (status === 'reject') status = 'rejected'
    if (status === 'archive' || status === 'deleted') status = 'archived'
    const allowed = ['active', 'pending', 'rejected', 'draft', 'inactive', 'archived', 'purge_requested']
    if (!allowed.includes(status)) {
      return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
    }

    const patch = {
      status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await admin
      .from('products')
      .update(patch)
      .eq('id', id)
      .select('id, name, title, slug, status, seller_id, base_price, cover_image, updated_at')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'محصول یافت نشد' }, { status: 404 })

    await writeAdminAudit({
      actorId: gate.user?.id,
      action: body.status ? `product.status.${body.status}` : 'product.patch',
      entityType: 'product',
      entityId: id,
      after: data,
    })
    
    try {
      if (data && (data.status === 'active' || data.status === 'rejected' || data.status === 'pending')) {
        let ownerId = null
        if (data.seller_id) {
          const { data: sel } = await admin.from('sellers').select('owner_id, shop_name').eq('id', data.seller_id).maybeSingle()
          ownerId = sel?.owner_id
          const title =
            data.status === 'active'
              ? 'محصول تأیید شد'
              : data.status === 'rejected'
                ? 'محصول رد شد'
                : 'وضعیت محصول تغییر کرد'
          const bodyText =
            data.status === 'active'
              ? `محصول «${data.title || data.name || ''}» تأیید و منتشر شد.`
              : data.status === 'rejected'
                ? `محصول «${data.title || data.name || ''}» رد شد.`
                : `وضعیت محصول «${data.title || data.name || ''}» به ${data.status} تغییر کرد.`
          if (ownerId) {
            await notifyUser({
              userId: ownerId,
              title,
              body: bodyText,
              type: 'product',
              meta: { product_id: data.id, status: data.status },
            })
          }
        }
      }
    } catch (_) { try { await logCritical('app/api/admin/products/[id]/route.js', _) } catch (_lc) {} }

    try {
      const { invalidateCatalogCache } = await import('@/lib/catalog-cache')
      if (typeof invalidateCatalogCache === 'function') invalidateCatalogCache()
    } catch (_) {}
    return NextResponse.json({ ok: true, product: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** DELETE /api/admin/products/[id]
 *  ?permanent=1 یا body.permanent → حذف قطعی از DB
 *  در غیر این صورت soft-delete = archived
 */
export async function DELETE(request, { params }) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const { admin } = gate
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })

    let permanent = false
    try {
      const url = new URL(request.url)
      permanent = url.searchParams.get('permanent') === '1' || url.searchParams.get('permanent') === 'true'
    } catch (_) {}
    if (!permanent) {
      try {
        const body = await request.json().catch(() => ({}))
        if (body && (body.permanent === true || body.permanent === 1 || body.permanent === '1')) permanent = true
      } catch (_) {}
    }

    if (permanent) {
      // وابستگی‌ها: variants/wishlist/… cascade یا set null طبق اسکما
      try {
        await admin.from('product_variants').delete().eq('product_id', id)
      } catch (_) {}
      try {
        await admin.from('product_tags').delete().eq('product_id', id)
      } catch (_) {}

      const { data, error } = await admin
        .from('products')
        .delete()
        .eq('id', id)
        .select('id, name, title, slug, seller_id')
        .maybeSingle()

      if (error) {
        try { await logCritical('app/api/admin/products/[id] DELETE permanent', error) } catch (_) {}
        return NextResponse.json({ ok: false, error: error.message || 'حذف قطعی ناموفق' }, { status: 400 })
      }
      if (!data) return NextResponse.json({ ok: false, error: 'محصول یافت نشد' }, { status: 404 })

      try {
        const { invalidateCatalogCache } = await import('@/lib/catalog-cache')
        if (typeof invalidateCatalogCache === 'function') invalidateCatalogCache()
      } catch (_) {}

      return NextResponse.json({ ok: true, deleted: true, permanent: true, product: data })
    }

    const { data, error } = await admin
      .from('products')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, title, slug, status, seller_id, updated_at')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'محصول یافت نشد' }, { status: 404 })

    try {
      const { invalidateCatalogCache } = await import('@/lib/catalog-cache')
      if (typeof invalidateCatalogCache === 'function') invalidateCatalogCache()
    } catch (_) {}
    return NextResponse.json({ ok: true, product: data, archived: true })
  } catch (e) {
    try { await logCritical('app/api/admin/products/[id] DELETE', e) } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
