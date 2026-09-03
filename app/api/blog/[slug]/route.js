import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

/** GET /api/blog/[slug] — جزئیات کامل مطلب */
export async function GET(_request, context) {
  try {
    const params = await context.params
    const slug = decodeURIComponent(String(params?.slug || '').trim())
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'slug الزامی است' }, { status: 400 })
    }

    let db
    try {
      db = createAdminClient()
    } catch {
      db = await createClient()
    }

    const { data, error } = await db
      .from('blog_posts')
      .select(
        'id, slug, title, excerpt, body, cover_image, cover_url, status, published_at, created_at, updated_at, category_id, seo_title, seo_description, tags',
      )
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: 'یافت نشد' }, { status: 404 })
    }

    // پیش‌نویس فقط برای ادمین
    if (data.status && data.status !== 'published') {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ ok: false, error: 'یافت نشد' }, { status: 404 })
      }
      const admin = createAdminClient()
      const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (profile?.role !== 'admin') {
        return NextResponse.json({ ok: false, error: 'یافت نشد' }, { status: 404 })
      }
    }

    return NextResponse.json(
      { ok: true, post: data },
      {
        headers:
          data.status === 'published'
            ? { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' }
            : { 'Cache-Control': 'no-store' },
      },
    )
  } catch (e) {
    try {
      await logCritical('app/api/blog/[slug]/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
