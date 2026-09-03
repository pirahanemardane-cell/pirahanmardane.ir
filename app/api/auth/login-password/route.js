import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { smsSuspiciousLogin } from '@/lib/sms/events'
import { clientIp, rateLimit, RATE_POLICIES, rateLimitResponse } from '@/lib/rate-limit'
import { logCritical } from '../../../../lib/critical-log'

export const dynamic = 'force-dynamic'

function normalizePhone(p) {
  let d = String(p || '').replace(/\D/g, '')
  if (d.startsWith('98') && d.length >= 12) d = '0' + d.slice(2)
  if (d.length === 10 && d.startsWith('9')) d = '0' + d
  return d
}

function toE164(phone0) {
  const d = normalizePhone(phone0)
  if (d.startsWith('0') && d.length === 11) return '+98' + d.slice(1)
  if (d.startsWith('98')) return '+' + d
  return d.startsWith('+') ? d : '+' + d
}

function phoneEmail(phone0) {
  return `u${normalizePhone(phone0)}@otp.local`
}

/** اثرانگشت ساده دستگاه از UA (بدون کتابخانه) */
function deviceFingerprint(req) {
  const ua = String(req.headers.get('user-agent') || '').slice(0, 180)
  let h = 0
  for (let i = 0; i < ua.length; i++) h = (h * 31 + ua.charCodeAt(i)) >>> 0
  return `d${h.toString(16)}`
}

const ADMIN_PHONES = new Set(['09921863063'])

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = normalizePhone(body?.phone)
    const password = String(body?.password || '')
    const remember = !!body?.remember

    if (!phone || phone.length < 10) {
      return NextResponse.json({ ok: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }
    if (!password) {
      return NextResponse.json({ ok: false, error: 'رمز را وارد کنید' }, { status: 400 })
    }

    const ip = clientIp(req)
    const rlIp = rateLimit(`login_ip:${ip}`, RATE_POLICIES.login_ip)
    if (!rlIp.ok) return rateLimitResponse(rlIp, 'تعداد تلاش ورود از این شبکه زیاد است')
    const rlId = rateLimit(`login:${phone}`, RATE_POLICIES.login_id)
    if (!rlId.ok) return rateLimitResponse(rlId, 'تعداد تلاش ورود برای این شماره زیاد است')

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const e164 = toE164(phone)
    const otpEmail = phoneEmail(phone)
    let data = null
    let lastErr = 'شماره یا رمز اشتباه است'

    try {
      const admin = createAdminClient()
      const { data: profs } = await admin
        .from('profiles')
        .select('id, full_name, role, phone, avatar_url')
        .eq('phone', phone)
        .limit(8)

      for (const pr of profs || []) {
        if (!pr?.id) continue
        const { data: ud } = await admin.auth.admin.getUserById(pr.id)
        const emails = [
          ...new Set(
            [
              ud?.user?.email,
              otpEmail,
              `${phone}@phone.local`,
              `${e164.replace('+', '')}@phone.local`,
            ].filter(Boolean)
          ),
        ]

        for (const email of emails) {
          const { data: d, error } = await supabase.auth.signInWithPassword({ email, password })
          if (!error && d?.user) {
            data = d
            if (d.user.email !== otpEmail) {
              try {
                await admin.auth.admin.updateUserById(d.user.id, {
                  email: otpEmail,
                  email_confirm: true,
                })
              } catch (_) {}
            }
            break
          }
          lastErr = error?.message || lastErr
        }
        if (data?.user) break
      }
    } catch (e) {
      console.warn('[login-password] profile lookup', e?.message || e)
    }

    if (!data?.user) {
      const attempts = [
        { email: otpEmail, password },
        { email: `${phone}@phone.local`, password },
        { email: `${e164.replace('+', '')}@phone.local`, password },
        { phone: e164, password },
      ]
      for (const cred of attempts) {
        const { data: d, error } = await supabase.auth.signInWithPassword(cred)
        if (!error && d?.user) {
          data = d
          break
        }
        lastErr = error?.message || lastErr
      }
    }

    if (!data?.user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'شماره یا رمز اشتباه است. اگر هنوز رمز نساخته‌اید، یک‌بار با پیامک وارد شوید و در تنظیمات پنل رمز بگذارید.',
          detail: lastErr,
        },
        { status: 401 }
      )
    }

    let profile = null
    const { data: p } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, avatar_url')
      .eq('id', data.user.id)
      .maybeSingle()
    profile = p

    if (profile?.id && ADMIN_PHONES.has(phone)) {
      try {
        const admin = createAdminClient()
        await admin
          .from('profiles')
          .update({
            role: 'admin',
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
        profile = { ...profile, role: 'admin', phone }
      } catch (e) {
        console.error('login-password admin elevate', e)
      }
    }

        // ===== MFA فقط برای ادمین =====
    const role = profile?.role || 'buyer'
    const needsMfa = role === 'admin'

    if (needsMfa) {
      try {
        const { issueOtp } = await import('@/lib/otp')
        const issued = await issueOtp(phone, { role: 'mfa', ttlMinutes: 5 })

        if (!issued?.ok) {
          console.error('MFA issueOtp error', issued?.error)
          return NextResponse.json(
            { ok: false, error: issued?.error || 'خطا در ایجاد کد تأیید' },
            { status: 500 }
          )
        }

        const { sendMelliPatternSms } = await import('@/lib/otp')
        const sent = await sendMelliPatternSms(issued.phone || phone, issued.code, {
          purpose: 'login',
          name: profile?.full_name || 'کاربر',
          minutes: issued.ttlMinutes || 5,
        })
        if (!sent?.ok) {
          console.error('MFA SMS error', sent)
          return NextResponse.json(
            { ok: false, error: sent?.error || 'ارسال پیامک ناموفق' },
            { status: 502 }
          )
        }
      } catch (e) {
        console.error('MFA send error', e)
        return NextResponse.json(
          { ok: false, error: 'خطا در ارسال کد تأیید' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        ok: true,
        mfa_required: true,
        message: 'کد تأیید دو مرحله‌ای به شماره شما ارسال شد',
        phone,
        mfa_token: data.user.id,
      })
    }

    // ===== لاگین عادی (برای buyer) =====
    const fp = deviceFingerprint(req)
    const known = req.cookies.get('pm_device')?.value || ''
    const isNewDevice = Boolean(known && known !== fp)
    if (isNewDevice) {
      try {
        const name = profile?.full_name || 'کاربر'
        const notifyPhone = profile?.phone || phone
        if (notifyPhone) {
          await smsSuspiciousLogin({
            phone: notifyPhone,
            name,
            time: new Date().toLocaleString('fa-IR'),
          })
        }
      } catch (_) {}
    }

    const res = NextResponse.json({
      ok: true,
      message: 'ورود موفق',
      user: {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone || phone,
      },
      profile,
      new_device: isNewDevice || !known,
    })

    res.cookies.set('pm_device', fp, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180,
      sameSite: 'lax',
      httpOnly: true,
    })

    if (remember) {
      res.cookies.set('pm_remember', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      })
    }
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || 'server error' }, { status: 500 })
  }
}
