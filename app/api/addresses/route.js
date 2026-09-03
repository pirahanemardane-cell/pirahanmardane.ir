import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

function cleanStr(v, max = 200) {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  return s.slice(0, max)
}

function mapRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    receiver: row.receiver_name || row.full_name,
    full_name: row.full_name,
    phone: row.phone,
    province: row.province,
    city: row.city,
    address: row.address_line,
    address_line: row.address_line,
    postal: row.postal_code,
    postal_code: row.postal_code,
    isDefault: !!row.is_default,
    is_default: !!row.is_default,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    created_at: row.created_at,
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ ok: false, error: 'پیکربندی سرور ناقص است' }, { status: 500 })
    }

    const { data, error } = await admin
      .from('addresses')
      .select('id, title, full_name, receiver_name, phone, province, city, address_line, postal_code, is_default, lat, lng, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      // fallback if lat/lng columns missing
      const r2 = await admin
        .from('addresses')
        .select('id, title, full_name, receiver_name, phone, province, city, address_line, postal_code, is_default, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (r2.error) {
        return NextResponse.json({ ok: false, error: r2.error.message }, { status: 400 })
      }
      return NextResponse.json({ ok: true, addresses: (r2.data || []).map(mapRow) })
    }

    return NextResponse.json({ ok: true, addresses: (data || []).map(mapRow) })
  } catch (e) { try { await logCritical('app/api/addresses/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'پیکربندی Supabase ناقص است' }, { status: 500 })
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    }

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json({ ok: false, error: 'پیکربندی سرور ناقص است' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const title = cleanStr(body.title, 40) || 'خانه'
    const fullName = cleanStr(body.full_name ?? body.fullName ?? body.receiver, 80)
    const phone = cleanStr(body.phone, 20)
    const province = cleanStr(body.province, 60)
    const city = cleanStr(body.city, 60)
    const addressLine = cleanStr(body.address_line ?? body.addressLine ?? body.address, 300)
    const postalCode = cleanStr(body.postal_code ?? body.postalCode ?? body.postal, 20)
    const isDefault = Boolean(body.is_default ?? body.isDefault)
    const lat = body.lat != null && body.lat !== '' ? Number(body.lat) : null
    const lng = body.lng != null && body.lng !== '' ? Number(body.lng) : null

    if (!fullName || !phone || !addressLine) {
      return NextResponse.json({ ok: false, error: 'نام گیرنده، موبایل و آدرس الزامی است' }, { status: 400 })
    }

    if (isDefault) {
      await admin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    const payload = {
      user_id: user.id,
      title,
      full_name: fullName,
      receiver_name: fullName,
      phone,
      province,
      city,
      address_line: addressLine,
      postal_code: postalCode,
      is_default: isDefault,
    }
    if (lat != null && !Number.isNaN(lat)) payload.lat = lat
    if (lng != null && !Number.isNaN(lng)) payload.lng = lng

    let { data, error } = await admin
      .from('addresses')
      .insert(payload)
      .select('id, title, full_name, receiver_name, phone, province, city, address_line, postal_code, is_default, lat, lng, created_at')
      .maybeSingle()

    if (error && /lat|lng|column/i.test(error.message || '')) {
      delete payload.lat
      delete payload.lng
      const r2 = await admin
        .from('addresses')
        .insert(payload)
        .select('id, title, full_name, receiver_name, phone, province, city, address_line, postal_code, is_default, created_at')
        .maybeSingle()
      data = r2.data
      error = r2.error
    }

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: 'آدرس ذخیره شد', address: mapRow(data) })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
