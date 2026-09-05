import { NextResponse } from 'next/server'
import { logCritical } from '../../../../../lib/critical-log'
import { createClient } from '../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import {
  normalizePhone,
  isValidIranMobile,
  verifyOtp,
  markPhoneVerified,
} from '../../../../../lib/otp'
import { isAdminPhone } from '../../../../../lib/api/admin-guard'
import { rateLimit, clientIp, rateLimitResponse } from "../../../../../lib/rate-limit"

function phoneEmail(phone) {
  return `u${normalizePhone(phone)}@otp.local`
}

/**
 * ورود session بدون پاک کردن رمز عبور کاربر.
 * قبلاً هر OTP یک password تصادفی می‌گذاشت و ورود با رمز خراب می‌شد.
 */
async function signInAsUser(admin, supabase, userId, phoneHint) {
  const { data: userData, error: getErr } = await admin.auth.admin.getUserById(userId)
  if (getErr || !userData?.user) {
    return { ok: false, error: getErr?.message || 'کاربر یافت نشد' }
  }

  const phone = normalizePhone(
    phoneHint || userData.user.user_metadata?.phone || userData.user.phone || ''
  )
  const standardEmail = phone ? phoneEmail(phone) : null
  const originalEmail = userData.user.email || null
  const hasUserPassword = !!(userData.user.user_metadata?.has_user_password)

  // یکسان‌سازی ایمیل با فرمت استاندارد (بدون دست زدن به رمز)
  if (standardEmail && originalEmail !== standardEmail) {
    try {
      await admin.auth.admin.updateUserById(userId, {
        email: standardEmail,
        email_confirm: true,
        user_metadata: {
          ...(userData.user.user_metadata || {}),
          phone: phone || userData.user.user_metadata?.phone,
        },
      })
    } catch (e) {
      console.warn('[otp/verify] email unify failed', e?.message || e)
    }
  }

  const emailsToTry = [...new Set([standardEmail, originalEmail].filter(Boolean))]

  // 1) magic link — هرگز رمز را عوض نمی‌کند
  for (const email of emailsToTry) {
    try {
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })
      const tokenHash = linkData?.properties?.hashed_token
      if (!linkErr && tokenHash) {
        const { data: sign, error: vErr } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: tokenHash,
        })
        if (!vErr && sign?.user) {
          return { ok: true, user: sign.user }
        }
        console.warn('[otp/verify] verifyOtp failed', email, vErr?.message)
      } else {
        console.warn('[otp/verify] generateLink failed', email, linkErr?.message)
      }
    } catch (e) {
      console.warn('[otp/verify] magiclink exception', e?.message || e)
    }
  }

  // 2) هرگز رمز کاربر موجود را عوض نکن (OTP فقط magiclink)
  //    اگر session ساخته نشد، کاربر می‌تواند با رمز پنل وارد شود
  return {
    ok: false,
    error: 'ورود پیامکی برقرار نشد. با رمزی که در پنل ساخته‌اید وارد شوید یا چند لحظه بعد دوباره پیامک را امتحان کنید.',
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const phone = normalizePhone(body.phone || body.mobile || '')
    const code = String(body.code || body.otp || '').trim()
    let roleWanted = body.role === 'seller' ? 'seller' : (body.role === 'admin' ? 'admin' : 'buyer')
    if (roleWanted === 'admin' && !isAdminPhone(phone)) roleWanted = 'buyer'


  {
    const ip = clientIp(request)
    const digits = String(phone || "").replace(/\D/g, "")
    const byPhone = rateLimit("otp:verify:" + digits, { limit: 15, windowMs: 15 * 60 * 1000 })
    const byIp = rateLimit("otp:verify:ip:" + ip, { limit: 40, windowMs: 15 * 60 * 1000 })
    if (!byPhone.ok || !byIp.ok) {
      const ra = Math.max(byPhone.retryAfterSec || 0, byIp.retryAfterSec || 0)
      const rl = rateLimitResponse(ra, "تعداد تلاش وارد کردن کد بیش از حد است. کمی بعد دوباره تلاش کنید.")
      return NextResponse.json(rl.body, { status: rl.status, headers: rl.headers })
    }
  }

if (!isValidIranMobile(phone)) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }
    if (!/^\d{4,8}$/.test(code)) {
      return NextResponse.json({ ok: false, error: 'کد تأیید نامعتبر است' }, { status: 400 })
    }

    const check = await verifyOtp(phone, code)
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: check.error }, { status: 400 })
    }

    await markPhoneVerified(phone)

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

    const { data: profiles, error: pErr } = await admin
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('phone', phone)
      .limit(5)

    if (pErr) {
      return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 })
    }

    const list = profiles || []
    let profile =
      list.find((p) => p.role === roleWanted) ||
      list.find((p) => p.full_name) ||
      list[0] ||
      null

    if (profile?.id && roleWanted === 'admin') {
      // فقط شماره‌های whitelist می‌توانند ادمین شوند — جلوگیری از privilege escalation
      if (isAdminPhone(phone)) {
        await admin.from('profiles').update({ role: 'admin', phone, updated_at: new Date().toISOString() }).eq('id', profile.id)
        profile = { ...profile, role: 'admin', phone }
      } else {
        // درخواست role=admin از کلاینت برای شماره غیرمجاز نادیده گرفته می‌شود
        roleWanted = 'buyer'
      }
    }

    if (profile?.id && profile.full_name) {
      const signed = await signInAsUser(admin, supabase, profile.id, phone)
      if (!signed.ok) {
        return NextResponse.json({ ok: false, error: signed.error || 'ورود ناموفق' }, { status: 500 })
      }

      // ورود به‌عنوان فروشنده: بدون ردیف واقعی در sellers نباید پنل باز شود
      if (roleWanted === 'seller') {
        const { data: shop } = await admin
          .from('sellers')
          .select('id, shop_name, slug, status, owner_id')
          .eq('owner_id', profile.id)
          .maybeSingle()
        if (!shop?.id) {
          // پروفایل هست ولی فروشگاه حذف شده یا هرگز ساخته نشده → تکمیل ثبت فروشگاه
          return NextResponse.json({
            ok: true,
            message: 'تکمیل ثبت فروشگاه',
            needs_profile: true,
            needs_shop: true,
            phone,
            existing_id: profile.id,
            user: signed.user
              ? { id: signed.user.id, email: signed.user.email }
              : { id: profile.id },
            profile: { ...profile, role: 'seller' },
          })
        }
        return NextResponse.json({
          ok: true,
          message: 'ورود موفق',
          needs_profile: false,
          phone,
          user: signed.user
            ? { id: signed.user.id, email: signed.user.email }
            : { id: profile.id },
          profile: { ...profile, role: 'seller' },
          seller: shop,
        })
      }

      return NextResponse.json({
        ok: true,
        message: 'ورود موفق',
        needs_profile: false,
        phone,
        user: signed.user
          ? { id: signed.user.id, email: signed.user.email }
          : { id: profile.id },
        profile,
      })
    }

    return NextResponse.json({
      ok: true,
      message: 'شماره تأیید شد؛ تکمیل مشخصات',
      needs_profile: true,
      phone,
      existing_id: profile?.id || null,
    })
  } catch (e) {
    console.error('otp/verify', e)
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
