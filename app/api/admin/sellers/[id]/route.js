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
  return { user, admin }
}

/** PATCH /api/admin/sellers/[id] — تأیید / رد / تعلیق فروشنده */
export async function PATCH(request, { params }) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const { admin } = gate
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const patch = { updated_at: new Date().toISOString() }
    if (body.status != null && String(body.status).trim() !== '') {
      const status = String(body.status || '').toLowerCase().trim()
      const allowed = ['approved', 'pending', 'rejected', 'suspended', 'active', 'archived']
      const normalized = status === 'active' ? 'approved' : status
      if (!allowed.includes(status) && status !== 'active') {
        return NextResponse.json({ ok: false, error: 'status نامعتبر' }, { status: 400 })
      }
      patch.status = normalized === 'active' ? 'approved' : normalized
    }
    for (const [key, aliases] of [
      ['kyc_status', ['kyc_status', 'kycStatus']],
      ['sheba_status', ['sheba_status', 'shebaStatus']],
      ['location_status', ['location_status', 'locationStatus']],
    ]) {
      let v = null
      for (const a of aliases) {
        if (body[a] != null) v = String(body[a]).toLowerCase()
      }
      if (v && ['pending', 'approved', 'rejected'].includes(v)) patch[key] = v
    }
    if (body.discount_quota != null || body.discountQuota != null) {
      patch.discount_quota = Math.max(0, parseInt(body.discount_quota ?? body.discountQuota, 10) || 0)
    }

    // تأیید / رد تصویر پروفایل و کاور
    const mediaAction = String(body.mediaAction || body.media_action || '').toLowerCase()
    const mediaKind = String(body.mediaKind || body.media_kind || '').toLowerCase() // logo | banner
    if (mediaAction && (mediaKind === 'logo' || mediaKind === 'banner')) {
      // خواندن وضعیت فعلی برای کپی pending → published
      const { data: cur } = await admin
        .from('sellers')
        .select('id, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status')
        .eq('id', id)
        .maybeSingle()
      if (mediaKind === 'logo') {
        if (mediaAction === 'approve') {
          const url = (cur && cur.logo_pending_url) || body.logo_url || body.logoUrl || (cur && cur.logo_url) || null
          if (url) patch.logo_url = url
          patch.logo_pending_url = null
          patch.logo_status = 'approved'
        } else if (mediaAction === 'reject') {
          patch.logo_pending_url = null
          patch.logo_status = 'rejected'
        }
      } else if (mediaKind === 'banner') {
        if (mediaAction === 'approve') {
          const url = (cur && cur.banner_pending_url) || body.banner_url || body.bannerUrl || (cur && cur.banner_url) || null
          if (url) patch.banner_url = url
          patch.banner_pending_url = null
          patch.banner_status = 'approved'
        } else if (mediaAction === 'reject') {
          patch.banner_pending_url = null
          patch.banner_status = 'rejected'
        }
      }
    }

    if (Object.keys(patch).length <= 1) {
      return NextResponse.json({ ok: false, error: 'فیلدی برای بروزرسانی نیست' }, { status: 400 })
    }

    let { data, error } = await admin
      .from('sellers')
      .update(patch)
      .eq('id', id)
      .select('id, owner_id, shop_name, slug, status, phone, city, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status, created_at, updated_at')
      .maybeSingle()

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'فروشنده یافت نشد' }, { status: 404 })

    await writeAdminAudit({
      actorId: gate.user?.id,
      action: body.status ? `seller.status.${body.status}` : 'seller.patch',
      entityType: 'seller',
      entityId: id,
      after: data,
    })
    
    try {
      if (data?.owner_id) {
        const st = data.status || ''
        const title =
          st === 'approved'
            ? 'فروشگاه تأیید شد'
            : st === 'rejected'
              ? 'فروشگاه رد شد'
              : st === 'suspended'
                ? 'فروشگاه تعلیق شد'
                : 'وضعیت فروشگاه تغییر کرد'
        await notifyUser({
          userId: data.owner_id,
          title,
          body: `وضعیت فروشگاه «${data.shop_name || ''}» به ${st} تغییر کرد.`,
          type: 'seller',
          meta: { seller_id: data.id, status: st },
        })
      }
    } catch (_) { try { await logCritical('app/api/admin/sellers/[id]/route.js', _) } catch (_lc) {} }
    return NextResponse.json({ ok: true, seller: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}


/** DELETE /api/admin/sellers/[id] */
export async function DELETE(request, { params }) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const { admin, user } = gate
    const id = params?.id || (await params)?.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })

    let permanent = false
    try {
      const url = new URL(request.url)
      permanent = url.searchParams.get('permanent') === '1' || url.searchParams.get('hard') === '1'
    } catch (_) {}
    try {
      const body = await request.clone().json().catch(() => ({}))
      if (body && (body.permanent === true || body.hard === true)) permanent = true
    } catch (_) {}

    if (permanent) {
      const { data: existing } = await admin
        .from('sellers')
        .select('id, shop_name, slug, status, owner_id')
        .eq('id', id)
        .maybeSingle()
      if (!existing) return NextResponse.json({ ok: false, error: 'فروشنده یافت نشد' }, { status: 404 })

      try {
        await admin.from('products').update({
          status: 'archived',
          seller_id: null,
          updated_at: new Date().toISOString(),
        }).eq('seller_id', id)
      } catch (_) {}
      try { await admin.from('seller_follows').delete().eq('seller_id', id) } catch (_) {}
      try { await admin.from('seller_payout_requests').delete().eq('seller_id', id) } catch (_) {}

      const { error } = await admin.from('sellers').delete().eq('id', id)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

      // پروفایل مالک را به خریدار برگردان تا ثبت‌نام بعدی مثل بار اول باشد
      if (existing.owner_id) {
        try {
          await admin.from('profiles').update({
            role: 'buyer',
            updated_at: new Date().toISOString(),
          }).eq('id', existing.owner_id).eq('role', 'seller')
        } catch (_) {}
      }

      try {
        await writeAdminAudit(admin, {
          actor_id: user?.id,
          action: 'seller.purge',
          entity_type: 'seller',
          entity_id: id,
          meta: {
            shop_name: existing.shop_name,
            prev_status: existing.status,
            owner_id: existing.owner_id,
          },
        })
      } catch (_) {}
      return NextResponse.json({
        ok: true,
        purged: true,
        id,
        shop_name: existing.shop_name,
        owner_id: existing.owner_id,
      })
    }


    const { data: existing } = await admin
      .from('sellers')
      .select('id, shop_name, slug, status, owner_id')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'فروشنده یافت نشد' }, { status: 404 })
    }

    // آرشیو محصولات فروشنده (seller_id حفظ می‌شود)
    try {
      await admin
        .from('products')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('seller_id', id)
        .neq('status', 'archived')
    } catch (_) {}

    const { data, error } = await admin
      .from('sellers')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, shop_name, slug, status, owner_id')
      .maybeSingle()

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message || 'آرشیو ناموفق — مقدار archived در status مجاز نیست',
      }, { status: 400 })
    }
    if (!data || String(data.status || '').toLowerCase() !== 'archived') {
      return NextResponse.json({
        ok: false,
        error: 'وضعیت archived در دیتابیس ذخیره نشد',
      }, { status: 400 })
    }

    try {
      await writeAdminAudit(admin, {
        actor_id: user?.id,
        action: 'seller.archive',
        entity_type: 'seller',
        entity_id: id,
        meta: { shop_name: existing.shop_name, prev_status: existing.status },
      })
    } catch (_) {}

    return NextResponse.json({
      ok: true,
      archived: true,
      deleted: true,
      id,
      seller: data,
      shop_name: existing.shop_name,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

