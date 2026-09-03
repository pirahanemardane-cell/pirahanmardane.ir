import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { smsPhoneChanged } from '../../../../lib/sms/events'

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, email, birth_date, gender, avatar_url, created_at')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    const needsPhone = !profile?.phone || String(profile.phone).replace(/\D/g, '').length < 10

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
      profile,
      needs_phone: needsPhone,
    })
  } catch (e) { try { await logCritical('app/api/auth/profile/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    const body = await request.json()
    const updates = {}

    if (
      Object.prototype.hasOwnProperty.call(body, 'full_name') ||
      Object.prototype.hasOwnProperty.call(body, 'fullName')
    ) {
      const val = body.full_name ?? body.fullName
      updates.full_name = val == null ? null : String(val).trim()
    }
    if (Object.prototype.hasOwnProperty.call(body, 'phone')) {
      updates.phone = body.phone == null ? null : String(body.phone).trim()
    }
    if (Object.prototype.hasOwnProperty.call(body, 'email')) {
      const em = body.email == null ? null : String(body.email).trim()
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        return NextResponse.json({ ok: false, error: 'ایمیل نامعتبر است' }, { status: 400 })
      }
      updates.email = em || null
    }

    if (
      Object.prototype.hasOwnProperty.call(body, 'birth_date') ||
      Object.prototype.hasOwnProperty.call(body, 'birthDate')
    ) {
      const bd = body.birth_date ?? body.birthDate
      updates.birth_date = bd == null || bd === '' ? null : String(bd).trim()
    }
    if (Object.prototype.hasOwnProperty.call(body, 'gender')) {
      const g = body.gender == null ? null : String(body.gender).trim()
      const ok = !g || ['مرد', 'زن', 'ترجیح نمی‌دهم', 'male', 'female', 'other'].includes(g)
      if (!ok) {
        return NextResponse.json({ ok: false, error: 'مقدار جنسیت نامعتبر است' }, { status: 400 })
      }
      updates.gender = g || null
    }

    if (Object.prototype.hasOwnProperty.call(body, 'avatar_url')) {
      updates.avatar_url = body.avatar_url == null ? null : String(body.avatar_url).trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'فیلدی برای به‌روزرسانی ارسال نشده' }, { status: 400 })
    }

    if (updates.full_name !== undefined && updates.full_name && updates.full_name.length > 80) {
      return NextResponse.json({ ok: false, error: 'نام بیش از حد طولانی است' }, { status: 400 })
    }

    let previousPhone = null
    let smsName = null
    if (updates.phone !== undefined) {
      const digits = String(updates.phone || '').replace(/\D/g, '')
      let normalized = digits
      if (digits.startsWith('98') && digits.length === 12) normalized = '0' + digits.slice(2)
      if (digits.startsWith('9') && digits.length === 10) normalized = '0' + digits
      if (!/^09\d{9}$/.test(normalized)) {
        return NextResponse.json(
          { ok: false, error: 'شماره موبایل معتبر الزامی است (۱۱ رقم با ۰۹)' },
          { status: 400 }
        )
      }
      updates.phone = normalized

      const { data: oldProf } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', user.id)
        .maybeSingle()
      previousPhone = oldProf?.phone || null
      smsName = updates.full_name || oldProf?.full_name || 'کاربر'
    }

    updates.updated_at = new Date().toISOString()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('id, full_name, role, phone, email, birth_date, gender, avatar_url, created_at')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    // SMS تغییر موبایل → به شماره قبلی (اگر بود) وگرنه شماره جدید
    if (updates.phone) {
      try {
        const notifyTo = previousPhone || updates.phone
        const nm = smsName || profile?.full_name || 'کاربر'
        if (notifyTo && previousPhone !== updates.phone) {
          await smsPhoneChanged(notifyTo, nm, updates.phone)
        }
      } catch (_) {}
    }

    return NextResponse.json({ ok: true, message: 'پروفایل به‌روز شد', profile })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
