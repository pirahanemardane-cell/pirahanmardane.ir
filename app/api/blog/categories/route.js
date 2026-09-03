import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function GET() {
  try {
    let db
    try {
      db = createAdminClient()
    } catch {
      db = await createClient()
    }
    const { data, error } = await db
      .from('blog_categories')
      .select('id, name, slug, active, sort_order')
      .order('sort_order', { ascending: true })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) { try { await logCritical('app/api/blog/categories/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ ok: false, error: 'نام لازم است' }, { status: 400 })
    const slug =
      String(body.slug || name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') || `cat-${Date.now().toString(36)}`
    const { data, error } = await admin
      .from('blog_categories')
      .insert({ name, slug, active: body.active !== false, sort_order: parseInt(body.sort_order, 10) || 0 })
      .select('*')
      .single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, item: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}


export async function PATCH(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const patch = {}
    if (body.name != null) patch.name = String(body.name).trim()
    if (body.slug != null) patch.slug = String(body.slug).trim()
    if (body.active != null) patch.active = !!body.active
    if (body.sort_order != null) patch.sort_order = parseInt(body.sort_order, 10) || 0
    const { data, error } = await gate.admin
      .from('blog_categories')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ ok: false, error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json({ ok: true, item: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id الزامی است' }, { status: 400 })
    const { error } = await gate.admin.from('blog_categories').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
