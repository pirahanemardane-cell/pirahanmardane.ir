import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const code = (url.searchParams.get('code') || '').trim().toUpperCase()
    const adminList = url.searchParams.get('admin') === '1'

    if (adminList) {
      const gate = await requireAdmin()
      if (gate.error) return gate.error
      const admin = createAdminClient()
      const { data, error } = await admin.from('coupons').select('*').order('created_at', { ascending: false })
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, items: data || [] })
    }

    let db
    try {
      db = createAdminClient()
    } catch {
      db = await createClient()
    }
    if (code) {
      const { data, error } = await db
        .from('coupons')
        .select('id, code, type, value, min_cart, max_uses, max_per_user, used_count, starts_at, ends_at, active, title')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle()
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      if (!data) return NextResponse.json({ ok: false, error: 'کوپن یافت نشد' }, { status: 404 })
      const now = Date.now()
      if (data.starts_at && new Date(data.starts_at).getTime() > now) {
        return NextResponse.json({ ok: false, error: 'کوپن هنوز فعال نشده' }, { status: 400 })
      }
      if (data.ends_at && new Date(data.ends_at).getTime() < now) {
        return NextResponse.json({ ok: false, error: 'کوپن منقضی شده' }, { status: 400 })
      }
      if (data.max_uses != null && data.used_count >= data.max_uses) {
        return NextResponse.json({ ok: false, error: 'سقف استفاده کوپن پر است' }, { status: 400 })
      }
      return NextResponse.json({ ok: true, coupon: data })
    }

    const { data, error } = await db
      .from('coupons')
      .select('id, code, type, value, min_cart, title, active')
      .eq('active', true)
      .limit(50)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) { try { await logCritical('app/api/coupons/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const code = String(body.code || '').trim().toUpperCase()
    if (!code) return NextResponse.json({ ok: false, error: 'کد کوپن لازم است' }, { status: 400 })
    const type = body.type === 'amount' ? 'amount' : 'percent'
    const value = Math.max(1, parseInt(body.value, 10) || 0)
    if (!value) return NextResponse.json({ ok: false, error: 'مقدار نامعتبر' }, { status: 400 })
    const row = {
      code,
      type,
      value,
      min_cart: Math.max(0, parseInt(body.min_cart, 10) || 0),
      max_uses: body.max_uses != null ? parseInt(body.max_uses, 10) : null,
      max_per_user: body.max_per_user != null ? parseInt(body.max_per_user, 10) : null,
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      active: body.active !== false,
      title: body.title ? String(body.title).slice(0, 120) : null,
      seller_id: body.seller_id || null,
    }
    const { data, error } = await admin.from('coupons').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, coupon: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
