import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import {
  normalizePhone,
  isValidIranMobile,
  isPhoneVerified,
  clearPhoneVerified,
} from '../../../../../lib/otp'
import crypto from 'crypto'

function phoneEmail(phone) {
  return `u${normalizePhone(phone)}@otp.local`
}

function toSlug(input) {
  const base = String(input || 'shop')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const safe = base || 'shop'
  return `${safe}-${Date.now().toString(36).slice(-4)}`
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const phone = normalizePhone(body.phone || body.mobile || '')
    const fullName = String(body.fullName || body.full_name || body.name || '').trim()
    const role = body.role === 'seller' ? 'seller' : 'buyer'
    const shopName = String(body.shopName || '').trim()
    const ownerName = String(body.ownerName || body.lastName || '').trim()

    if (!isValidIranMobile(phone)) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }
    if (!(await isPhoneVerified(phone))) {
      return NextResponse.json(
        { ok: false, error: 'ابتدا کد پیامک را تأیید کنید' },
        { status: 401 }
      )
    }
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, error: 'نام الزامی است' }, { status: 400 })
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { ok: false, error: 'پیکربندی سرور ناقص است (SERVICE_ROLE)' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const displayName =
      role === 'seller'
        ? (ownerName || fullName)
        : `${fullName}${ownerName ? ' ' + ownerName : ''}`.trim()

    const finalShopName = role === 'seller' ? (shopName || fullName) : null

    const { data: existingList } = await admin
      .from('profiles')
      .select('id, full_name, role, phone')
      .eq('phone', phone)
      .limit(5)

    let userId = existingList?.[0]?.id || null
    const email = phoneEmail(phone)
    // فقط برای کاربر جدید رمز تصادفی؛ کاربر موجود رمزش را حفظ می‌کند
    let sessionPassword = null

    if (userId) {
      await admin.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true,
        user_metadata: { full_name: displayName, role, phone },
      })
      const nextRole = existingList[0]?.role === 'admin' ? 'admin' : role
      await admin.from('profiles').upsert({
        id: userId,
        full_name: displayName,
        phone,
        role: nextRole,
        updated_at: new Date().toISOString(),
      })
    } else {
      sessionPassword = crypto.randomBytes(24).toString('base64url')
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password: sessionPassword,
        email_confirm: true,
        user_metadata: { full_name: displayName, role, phone },
      })
      if (cErr) {
        if (String(cErr.message || '').toLowerCase().includes('already')) {
          const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
          const found = (listed?.users || []).find((u) => u.email === email)
          if (!found) {
            return NextResponse.json({ ok: false, error: cErr.message }, { status: 400 })
          }
          userId = found.id
          // کاربر از قبل بود — رمز را عوض نکن
          await admin.auth.admin.updateUserById(userId, {
            email,
            email_confirm: true,
            user_metadata: { full_name: displayName, role, phone },
          })
          sessionPassword = null
        } else {
          return NextResponse.json({ ok: false, error: cErr.message }, { status: 400 })
        }
      } else {
        userId = created.user.id
      }
      await admin.from('profiles').upsert({
        id: userId,
        full_name: displayName,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
    }

    let sellerRow = null
    if (role === 'seller' && userId) {
      const { data: existingSeller } = await admin
        .from('sellers')
        .select('id, owner_id, shop_name, slug, status')
        .eq('owner_id', userId)
        .limit(1)
        .maybeSingle()

      if (existingSeller?.id) {
        const { data: updated } = await admin
          .from('sellers')
          .update({
            shop_name: finalShopName || existingSeller.shop_name,
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSeller.id)
          .select('id, owner_id, shop_name, slug, status')
          .maybeSingle()
        sellerRow = updated || existingSeller
      } else {
        const { data: orphan } = await admin
          .from('sellers')
          .select('id, shop_name, slug, status')
          .is('owner_id', null)
          .limit(1)
          .maybeSingle()

        if (orphan?.id) {
          const { data: linked } = await admin
            .from('sellers')
            .update({
              owner_id: userId,
              shop_name: finalShopName || orphan.shop_name || 'فروشگاه',
              phone,
              status: 'pending',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orphan.id)
            .select('id, owner_id, shop_name, slug, status')
            .maybeSingle()
          sellerRow = linked
        } else {
          const slug = toSlug(finalShopName || 'shop')
          const { data: createdSeller, error: sErr } = await admin
            .from('sellers')
            .insert({
              owner_id: userId,
              shop_name: finalShopName || 'فروشگاه',
              slug,
              status: 'pending',
              phone,
            })
            .select('id, owner_id, shop_name, slug, status')
            .maybeSingle()
          if (sErr) {
            console.error('seller insert', sErr)
          } else {
            sellerRow = createdSeller
          }
        }
      }

      await admin
        .from('profiles')
        .update({ role: 'seller', updated_at: new Date().toISOString() })
        .eq('id', userId)
        .neq('role', 'admin')
    }

    // ورود بدون پاک کردن رمز کاربر (magiclink)؛ فقط کاربر تازه با رمز موقت
    let sign = null
    try {
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })
      const tokenHash = linkData?.properties?.hashed_token
      if (!linkErr && tokenHash) {
        const { data: s, error: vErr } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: tokenHash,
        })
        if (!vErr && s?.user) sign = s
      }
    } catch (e) { try { await logCritical('app/api/auth/otp/complete/route.js', e) } catch (_lc) {}
      console.warn('otp/complete magiclink', e?.message || e)
    }
    if (!sign?.user && sessionPassword) {
      const { data: s, error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password: sessionPassword,
      })
      if (signErr) {
        return NextResponse.json({ ok: false, error: signErr.message }, { status: 500 })
      }
      sign = s
    }
    if (!sign?.user) {
      // کاربر موجود: هرگز رمز را عوض نکن — فقط کاربر تازه‌ساخته در همین درخواست sessionPassword دارد
      if (!sessionPassword) {
        return NextResponse.json({
          ok: false,
          error: 'ورود برقرار نشد. با رمز پنل وارد شوید یا دوباره پیامک را امتحان کنید.',
        }, { status: 400 })
      }
      const { data: s, error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password: sessionPassword,
      })
      if (signErr) {
        return NextResponse.json({ ok: false, error: signErr.message }, { status: 500 })
      }
      sign = s
    }

    await clearPhoneVerified(phone)

    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      message: 'ثبت‌نام و ورود موفق',
      user: sign.user ? { id: sign.user.id, email: sign.user.email } : { id: userId },
      profile: profile || {
        id: userId,
        full_name: displayName,
        role,
        phone,
      },
      seller: sellerRow || undefined,
      shopName: role === 'seller' ? finalShopName : undefined,
      ownerName: role === 'seller' ? ownerName || fullName : undefined,
    })
  } catch (e) {
    console.error('otp/complete', e)
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
