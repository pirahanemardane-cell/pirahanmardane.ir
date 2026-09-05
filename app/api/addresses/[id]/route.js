import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

function cleanStr(v, max = 200) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  return s.slice(0, max)
}

export async function PATCH(request, context) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    const params = await context.params
    const id = params?.id
    if (!id) {
      return NextResponse.json({ ok: false, error: 'شناسه آدرس الزامی است' }, { status: 400 })
    }

    const body = await request.json()
    const updates = {}

    if (Object.prototype.hasOwnProperty.call(body, 'title')) updates.title = cleanStr(body.title, 40)
    if (Object.prototype.hasOwnProperty.call(body, 'full_name') || Object.prototype.hasOwnProperty.call(body, 'fullName')) {
      updates.full_name = cleanStr(body.full_name ?? body.fullName, 80)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'phone')) updates.phone = cleanStr(body.phone, 20)
    if (Object.prototype.hasOwnProperty.call(body, 'province')) updates.province = cleanStr(body.province, 60)
    if (Object.prototype.hasOwnProperty.call(body, 'city')) updates.city = cleanStr(body.city, 60)
    if (Object.prototype.hasOwnProperty.call(body, 'address_line') || Object.prototype.hasOwnProperty.call(body, 'addressLine')) {
      updates.address_line = cleanStr(body.address_line ?? body.addressLine, 300)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'postal_code') || Object.prototype.hasOwnProperty.call(body, 'postalCode')) {
      updates.postal_code = cleanStr(body.postal_code ?? body.postalCode, 20)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'is_default') || Object.prototype.hasOwnProperty.call(body, 'isDefault')) {
      updates.is_default = Boolean(body.is_default ?? body.isDefault)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'lat') && body.lat != null && body.lat !== '') {
      const n = Number(body.lat)
      if (!Number.isNaN(n)) updates.lat = n
    }
    if (Object.prototype.hasOwnProperty.call(body, 'lng') && body.lng != null && body.lng !== '') {
      const n = Number(body.lng)
      if (!Number.isNaN(n)) updates.lng = n
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'فیلدی برای به‌روزرسانی ارسال نشده' }, { status: 400 })
    }

    // ensure ownership before update
    const { data: existing, error: findErr } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (findErr || !existing) {
      return NextResponse.json({ ok: false, error: 'آدرس پیدا نشد' }, { status: 404 })
    }

    if (updates.is_default === true) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, full_name, phone, province, city, address_line, postal_code, is_default, created_at')
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: 'آدرس به‌روز شد', address: data })
  } catch (e) { try { await logCritical('app/api/addresses/[id]/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(_request, context) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    const params = await context.params
    const id = params?.id
    if (!id) {
      return NextResponse.json({ ok: false, error: 'شناسه آدرس الزامی است' }, { status: 400 })
    }

    const { data: existing, error: findErr } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (findErr || !existing) {
      return NextResponse.json({ ok: false, error: 'آدرس پیدا نشد' }, { status: 404 })
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: 'آدرس حذف شد' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
