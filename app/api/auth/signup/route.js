import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import {
  isPhoneVerified,
  clearPhoneVerified,
  normalizePhone as otpNormalizePhone,
} from '../../../../lib/otp'
import crypto from 'crypto'

function normalizePhone(p) {
  let d = String(p || '').replace(/\D/g, '')
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2)
  if (d.startsWith('9') && d.length === 10) d = '0' + d
  return d
}

function phoneEmail(phone0) {
  return 'u' + normalizePhone(phone0) + '@otp.local'
}

function toSlug(input) {
  const base = String(input || 'shop')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return (base || 'shop') + '-' + Date.now().toString(36).slice(-4)
}

/** فروشگاه فعال (نه آرشیو/رد) */
function isActiveSellerStatus(st) {
  const s = String(st || '').toLowerCase()
  return s === 'pending' || s === 'approved' || s === 'active' || s === 'suspended'
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const ownerName = String(body.fullName || body.full_name || body.ownerName || body.owner_name || '').trim()
    const shopName = String(body.shopName || body.shop_name || '').trim()
    const role = body.role === 'seller' ? 'seller' : 'buyer'
    const password = String(body.password || '')
    const phone = normalizePhone(body.phone || body.mobile || '')
    const emailRaw = String(body.email || '').trim().toLowerCase()
    const email = emailRaw && emailRaw.includes('@') ? emailRaw : phoneEmail(phone)

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, error: 'شماره موبایل معتبر (۱۱ رقم با ۰۹) الزامی است' },
        { status: 400 }
      )
    }
    if (role === 'seller') {
      if (!shopName || shopName.length < 2) {
        return NextResponse.json({ ok: false, error: 'نام فروشگاه الزامی است' }, { status: 400 })
      }
      if (!ownerName || ownerName.length < 2) {
        return NextResponse.json({ ok: false, error: 'نام مسئول الزامی است' }, { status: 400 })
      }
    } else if (!ownerName || ownerName.length < 2) {
      return NextResponse.json({ ok: false, error: 'نام الزامی است' }, { status: 400 })
    }
    // رمز اختیاری؛ اگر آمد حداقل ۶
    if (password && password.length < 6) {
      return NextResponse.json({ ok: false, error: 'رمز حداقل ۶ کاراکتر باشد' }, { status: 400 })
    }

    // OTP تأییدشده (ثبت‌نام استاندارد)
    try {
      const verified = await isPhoneVerified(phone)
      if (!verified) {
        return NextResponse.json(
          { ok: false, error: 'ابتدا شماره را با کد پیامک تأیید کنید', needs_otp: true },
          { status: 401 }
        )
      }
    } catch (_) {}

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ ok: false, error: 'پیکربندی سرور ناقص است' }, { status: 500 })
    }

    const { data: existingProf } = await admin
      .from('profiles')
      .select('id, role, full_name, phone')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle()

    let userId = existingProf?.id || null
    let sessionPassword = password || null

    // اگر پروفایل هست و نقش فروشنده فعال با فروشگاه فعال → ثبت تکراری
    if (userId && role === 'seller') {
      const { data: activeShop } = await admin
        .from('sellers')
        .select('id, status, shop_name')
        .eq('owner_id', userId)
        .limit(5)
      const live = (activeShop || []).find((s) => isActiveSellerStatus(s.status))
      if (live) {
        return NextResponse.json(
          { ok: false, error: 'این شماره فروشگاه فعال دارد — وارد شوید' },
          { status: 400 }
        )
      }
    }

    if (userId && role === 'buyer') {
      return NextResponse.json(
        { ok: false, error: 'این شماره قبلاً ثبت شده — وارد شوید' },
        { status: 400 }
      )
    }

    if (!userId) {
      sessionPassword = password || crypto.randomBytes(24).toString('base64url')
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password: sessionPassword,
        email_confirm: true,
        user_metadata: {
          full_name: ownerName,
          role,
          phone,
          has_user_password: !!password,
        },
      })
      if (cErr) {
        const msg = String(cErr.message || '').toLowerCase()
        if (msg.includes('already') || msg.includes('registered')) {
          const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
          const found = (listed?.users || []).find((u) => u.email === email)
          if (found?.id) userId = found.id
          else return NextResponse.json({ ok: false, error: cErr.message }, { status: 400 })
        } else {
          return NextResponse.json({ ok: false, error: cErr.message || 'ثبت‌نام ناموفق' }, { status: 400 })
        }
      } else {
        userId = created.user.id
      }
    } else if (password) {
      // کاربر قبلی (مثلاً بعد از حذف دائم فروشنده) — رمز جدید اختیاری
      try {
        await admin.auth.admin.updateUserById(userId, {
          password,
          email,
          email_confirm: true,
          user_metadata: {
            full_name: ownerName,
            role,
            phone,
            has_user_password: true,
          },
        })
        sessionPassword = password
      } catch (_) {}
    }

    await admin.from('profiles').upsert({
      id: userId,
      full_name: ownerName,
      phone,
      role: role === 'seller' ? 'seller' : 'buyer',
      updated_at: new Date().toISOString(),
    })

    let sellerRow = null
    if (role === 'seller') {
      // پاک کردن فروشگاه‌های آرشیو/رد مانده روی همین owner
      try {
        const { data: olds } = await admin
          .from('sellers')
          .select('id, status')
          .eq('owner_id', userId)
        for (const s of olds || []) {
          if (!isActiveSellerStatus(s.status)) {
            try {
              await admin.from('products').update({
                status: 'archived',
                seller_id: null,
                updated_at: new Date().toISOString(),
              }).eq('seller_id', s.id)
            } catch (_) {}
            try {
              await admin.from('sellers').delete().eq('id', s.id)
            } catch (_) {}
          }
        }
      } catch (_) {}

      const slug = toSlug(shopName)
      const { data: createdSeller, error: sErr } = await admin
        .from('sellers')
        .insert({
          owner_id: userId,
          shop_name: shopName,
          slug,
          status: 'pending',
          phone,
        })
        .select('id, owner_id, shop_name, slug, status, phone')
        .maybeSingle()
      if (sErr) {
        return NextResponse.json({ ok: false, error: sErr.message || 'ثبت فروشگاه ناموفق' }, { status: 400 })
      }
      sellerRow = createdSeller
    }

    const supabase = await createClient()
    if (supabase && sessionPassword) {
      try {
        await supabase.auth.signInWithPassword({ email: phoneEmail(phone), password: sessionPassword })
      } catch (_) {
        try {
          await supabase.auth.signInWithPassword({ email, password: sessionPassword })
        } catch (__) {}
      }
    } else if (supabase) {
      try {
        const { data: linkData } = await admin.auth.admin.generateLink({
          type: 'magiclink',
          email: phoneEmail(phone),
        })
        const tokenHash = linkData?.properties?.hashed_token
        if (tokenHash) {
          await supabase.auth.verifyOtp({ type: 'email', token_hash: tokenHash })
        }
      } catch (_) {}
    }

    try {
      await clearPhoneVerified(phone)
    } catch (_) {}

    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      message: 'ثبت‌نام موفق بود',
      user: { id: userId, email },
      profile: profile || {
        id: userId,
        full_name: ownerName,
        role: role === 'seller' ? 'seller' : 'buyer',
        phone,
      },
      seller: sellerRow || undefined,
      shopName: role === 'seller' ? shopName : undefined,
      re_registered: !!existingProf,
    })
  } catch (e) {
    try {
      await logCritical('app/api/auth/signup/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
