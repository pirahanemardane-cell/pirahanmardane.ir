import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function POST(request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const fullName = String(body.fullName || body.full_name || '').trim()
    const role = body.role === 'seller' ? 'seller' : 'buyer'
    let phone = String(body.phone || '').replace(/\D/g, '')
    if (phone.startsWith('98') && phone.length === 12) phone = '0' + phone.slice(2)
    if (phone.startsWith('9') && phone.length === 10) phone = '0' + phone

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'ایمیل و رمز الزامی است' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'رمز حداقل ۶ کاراکتر باشد' }, { status: 400 })
    }
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, error: 'شماره موبایل معتبر (۱۱ رقم با ۰۹) الزامی است' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, phone } },
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    // ذخیره شماره در profiles
    if (data.user?.id) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName || null,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      ok: true,
      message: 'ثبت‌نام موفق بود',
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    })
  } catch (e) { try { await logCritical('app/api/auth/signup/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
