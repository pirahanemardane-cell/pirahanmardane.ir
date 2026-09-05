import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

/** GET /api/blog — پست‌های published؛ ?all=1 فقط ادمین همه وضعیت‌ها */
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const all = url.searchParams.get('all') === '1'
    const limit = Math.min(Number(url.searchParams.get('limit') || (all ? 100 : 20)), 100)
    let db
    try {
      db = createAdminClient()
    } catch {
      db = await createClient()
    }

    if (all) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
      const admin = createAdminClient()
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (profile?.role !== 'admin') {
        return NextResponse.json({ ok: false, error: 'فقط ادمین' }, { status: 403 })
      }
      const { data, error } = await admin
        .from('blog_posts')
        .select('id, slug, title, excerpt, body, cover_image, cover_url, status, published_at, created_at, category_id')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, posts: data || [] })
    }

    const { data, error } = await db
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image, status, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json(
      { ok: true, posts: data || [] },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } },
    )
  } catch (e) { try { await logCritical('app/api/blog/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** POST /api/blog — فقط ادمین */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'فقط ادمین' }, { status: 403 })
    }
    const body = await request.json().catch(() => ({}))
    const title = String(body.title || '').trim()
    if (!title) return NextResponse.json({ ok: false, error: 'عنوان لازم است' }, { status: 400 })
    const slug =
      String(body.slug || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') || `post-${Date.now().toString(36)}`
    const row = {
      title,
      slug,
      excerpt: body.excerpt || null,
      body: body.body || body.content || null,
      cover_image: body.cover_image || null,
      status: body.status === 'draft' ? 'draft' : 'published',
      published_at: new Date().toISOString(),
    }
    const { data, error } = await admin.from('blog_posts').insert(row).select('*').single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, post: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}


/** PATCH — ادمین: بروزرسانی پست body: { id, ...fields } */
export async function PATCH(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') return NextResponse.json({ ok: false, error: 'فقط ادمین' }, { status: 403 })
    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const patch = { updated_at: new Date().toISOString() }
    if (body.title != null) patch.title = String(body.title).trim()
    if (body.slug != null) patch.slug = String(body.slug).trim()
    if (body.excerpt != null) patch.excerpt = body.excerpt
    if (body.body != null || body.content != null) patch.body = body.body || body.content
    if (body.cover_image != null || body.cover_url != null) {
      patch.cover_url = body.cover_url || body.cover_image
      patch.cover_image = body.cover_image || body.cover_url
    }
    if (body.status != null) patch.status = body.status === 'draft' ? 'draft' : 'published'
    if (body.category_id != null) patch.category_id = body.category_id
    const { data, error } = await admin.from('blog_posts').update(patch).eq('id', id).select('*').maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, post: data })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** DELETE body: { id } */
export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })
    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') return NextResponse.json({ ok: false, error: 'فقط ادمین' }, { status: 403 })
    const body = await request.json().catch(() => ({}))
    const id = body.id || new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const { error } = await admin.from('blog_posts').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
