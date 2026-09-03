import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { smsBankChanged } from '../../../../lib/sms/events'

function mapSeller(row, profile) {
  if (!row) return null
  return {
    id: row.id,
    ownerId: row.owner_id,
    shopName: row.shop_name || 'فروشگاه',
    name: row.shop_name || profile?.full_name || 'فروشنده',
    slug: row.slug || '',
    status: row.status || 'pending',
    about: row.about || '',
    city: row.city || '',
    address: row.address || '',
    phone: row.phone || profile?.phone || '',
    sheba: row.sheba || '',
    logoUrl: row.logo_url || '',
    bannerUrl: row.banner_url || '',
    logoPendingUrl: row.logo_pending_url || '',
    bannerPendingUrl: row.banner_pending_url || '',
    logoStatus: row.logo_status || (row.logo_url ? 'approved' : 'none'),
    bannerStatus: row.banner_status || (row.banner_url ? 'approved' : 'none'),
    rating: row.rating != null ? Number(row.rating) : 0,
    ratingCount: row.rating_count != null ? Number(row.rating_count) : 0,
    licenseApproved: row.status === 'approved',
    fastShipEnabled: true,
    role: 'seller',
    kycStatus: row.kyc_status || row.kycStatus || 'pending',
    shebaStatus: row.sheba_status || 'pending',
    locationStatus: row.location_status || 'pending',
    nationalId: row.national_id || '',
    discountQuota: row.discount_quota != null ? Number(row.discount_quota) : 0,
  }
}

/** GET /api/seller/me — فروشگاه کاربر لاگین‌شده */
export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, phone, email, role')
      .eq('id', user.id)
      .maybeSingle()

    let { data: seller } = await admin
      .from('sellers')
      .select('id, owner_id, shop_name, slug, status, about, city, address, phone, sheba, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status, rating, rating_count, created_at, updated_at')
      .eq('owner_id', user.id)
      .maybeSingle()

    // سازگاری با user_id اگر ستون باشد
    if (!seller) {
      const q2 = await admin
        .from('sellers')
        .select('id, owner_id, shop_name, slug, status, about, city, address, phone, sheba, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status, rating, rating_count, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle()
      seller = q2.data
    }

    if (!seller) {
      return NextResponse.json({ ok: false, error: 'فروشگاه یافت نشد', code: 'NO_SHOP' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      seller: mapSeller(seller, profile),
      profile: profile || null,
    })
  } catch (e) { try { await logCritical('app/api/seller/me/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** PATCH /api/seller/me — ویرایش اطلاعات فروشگاه */
export async function PATCH(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('sellers')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'فروشگاه یافت نشد' }, { status: 404 })
    }

    const patch = { updated_at: new Date().toISOString() }
    if (body.shop_name != null || body.shopName != null) {
      patch.shop_name = String(body.shop_name || body.shopName || '').trim().slice(0, 120)
    }
    if (body.about != null) patch.about = String(body.about).trim().slice(0, 2000)
    if (body.city != null) patch.city = String(body.city).trim().slice(0, 80)
    if (body.address != null) patch.address = String(body.address).trim().slice(0, 300)
    if (body.phone != null) patch.phone = String(body.phone).replace(/\D/g, '').slice(0, 15)
    if (body.sheba != null) patch.sheba = String(body.sheba).replace(/\s/g, '').slice(0, 34)
    // تصاویر جدید تا تأیید ادمین فقط در pending — منتشر نمی‌شوند
    if (body.logo_url != null || body.logoUrl != null || body.logoPendingUrl != null || body.logo_pending_url != null) {
      const next = String(body.logoPendingUrl ?? body.logo_pending_url ?? body.logo_url ?? body.logoUrl ?? '').slice(0, 500)
      if (!next) {
        patch.logo_pending_url = null
        patch.logo_status = 'none'
      } else {
        patch.logo_pending_url = next
        patch.logo_status = 'pending'
      }
    }
    if (body.banner_url != null || body.bannerUrl != null || body.bannerPendingUrl != null || body.banner_pending_url != null) {
      const next = String(body.bannerPendingUrl ?? body.banner_pending_url ?? body.banner_url ?? body.bannerUrl ?? '').slice(0, 500)
      if (!next) {
        patch.banner_pending_url = null
        patch.banner_status = 'none'
      } else {
        patch.banner_pending_url = next
        patch.banner_status = 'pending'
      }
    }
    // status فقط ادمین عوض می‌کند

    let { data: updated, error } = await admin
      .from('sellers')
      .update(patch)
      .eq('id', existing.id)
      .select('id, owner_id, shop_name, slug, status, about, city, address, phone, sheba, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status, rating, rating_count, kyc_status, sheba_status, location_status, national_id, discount_quota')
      .maybeSingle()

    // سازگاری: اگر ستون pending نباشد، مستقیم روی logo_url بنویس (legacy)
    if (error && /logo_pending|banner_pending|logo_status|banner_status|column/i.test(String(error.message || ''))) {
      const legacy = { updated_at: patch.updated_at }
      if (patch.logo_pending_url !== undefined) legacy.logo_url = patch.logo_pending_url
      if (patch.banner_pending_url !== undefined) legacy.banner_url = patch.banner_pending_url
      const r2 = await admin.from('sellers').update(legacy).eq('id', existing.id)
        .select('id, owner_id, shop_name, slug, status, about, city, address, phone, sheba, logo_url, banner_url, rating, rating_count, kyc_status, sheba_status, location_status, national_id, discount_quota')
        .maybeSingle()
      updated = r2.data
      error = r2.error
    }

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, phone, email, role')
      .eq('id', user.id)
      .maybeSingle()

    if (body.sheba != null) {
      try {
        const phone = updated?.phone || profile?.phone
        const name = updated?.shop_name || 'فروشنده'
        if (phone) await smsBankChanged(phone, name)
      } catch (_) {}
    }
    return NextResponse.json({ ok: true, seller: mapSeller(updated, profile) })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
