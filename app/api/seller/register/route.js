import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

/**
 * ثبت‌نام / ایجاد فروشگاه
 * اگر فروشنده قبلاً توسط ادمین حذف دائم یا آرشیو شده باشد،
 * ثبت مجدد با همان کاربر = مثل بار اول (فروشگاه pending تازه).
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const shop_name = String(body.shop_name || body.shopName || body.name || '').trim()
    if (!shop_name) return NextResponse.json({ ok: false, error: 'نام فروشگاه الزامی است' }, { status: 400 })

    const admin = createAdminClient()
    const phone = String(body.phone || user.phone || '').trim() || null
    const ownerName = String(body.owner_name || body.ownerName || body.full_name || body.fullName || '').trim() || null

    await admin.from('profiles').upsert({
      id: user.id,
      role: 'seller',
      phone,
      full_name: ownerName,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    const { data: existing } = await admin
      .from('sellers')
      .select('id, shop_name, status, slug, owner_id, phone, city, created_at')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (existing) {
      const st = String(existing.status || '').toLowerCase()
      // فعال / در انتظار / تأییدشده → همان فروشگاه
      if (st === 'pending' || st === 'approved' || st === 'active') {
        return NextResponse.json({ ok: true, seller: existing, already: true, real: true })
      }
      // آرشیو / رد / معلق پس از حذف ادمین → پاک کردن ردیف قدیمی و ثبت از صفر
      if (st === 'archived' || st === 'rejected' || st === 'suspended' || st === 'blocked' || st === 'banned') {
        try {
          await admin.from('products').update({
            status: 'archived',
            seller_id: null,
            updated_at: new Date().toISOString(),
          }).eq('seller_id', existing.id)
        } catch (_) {}
        try { await admin.from('seller_follows').delete().eq('seller_id', existing.id) } catch (_) {}
        const { error: delErr } = await admin.from('sellers').delete().eq('id', existing.id)
        if (delErr) {
          return NextResponse.json({
            ok: false,
            error: delErr.message || 'حذف فروشگاه قبلی ناموفق بود',
          }, { status: 400 })
        }
        // ادامه می‌دهد به insert تازه (مثل بار اول)
      } else {
        return NextResponse.json({ ok: true, seller: existing, already: true, real: true })
      }
    }

    const baseSlug = String(body.slug || shop_name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      .slice(0, 50) || ('shop-' + user.id.slice(0, 8))

    const row = {
      owner_id: user.id,
      shop_name,
      slug: baseSlug,
      status: 'pending',
      about: body.about || null,
      city: body.city || null,
      phone,
      logo_url: body.logo_url || body.logoUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // فیلدهای احراز را از صفر می‌گذاریم اگر ستون وجود داشته باشد
    for (const k of ['kyc_status', 'sheba_status', 'location_status', 'national_id', 'sheba']) {
      try {
        row[k] = k === 'national_id' || k === 'sheba' ? null : 'none'
      } catch (_) {}
    }

    let data = null
    let error = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const tryRow = {
        ...row,
        slug: attempt === 0 ? row.slug : `${row.slug}-${user.id.slice(0, 6)}${attempt}`,
      }
      // اگر ستون KYC در DB نبود، بدون آن‌ها دوباره insert
      const ins = await admin
        .from('sellers')
        .insert(tryRow)
        .select('id, shop_name, slug, status, owner_id, phone, city, created_at')
        .single()
      data = ins.data
      error = ins.error
      if (!error) break
      const msg = String(error.message || '').toLowerCase()
      const code = String(error.code || '')
      if (code === '23505' || msg.includes('duplicate') || msg.includes('unique')) continue
      // ستون نامعتبر → بدون فیلدهای اختیاری
      if (msg.includes('column') || code === '42703') {
        const minimal = {
          owner_id: tryRow.owner_id,
          shop_name: tryRow.shop_name,
          slug: tryRow.slug,
          status: 'pending',
          about: tryRow.about,
          city: tryRow.city,
          phone: tryRow.phone,
          logo_url: tryRow.logo_url,
          created_at: tryRow.created_at,
          updated_at: tryRow.updated_at,
        }
        const ins2 = await admin
          .from('sellers')
          .insert(minimal)
          .select('id, shop_name, slug, status, owner_id, phone, city, created_at')
          .single()
        data = ins2.data
        error = ins2.error
        if (!error) break
      }
      break
    }

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, seller: data, real: true, fresh: true })
  } catch (e) {
    try { await logCritical('app/api/seller/register/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
