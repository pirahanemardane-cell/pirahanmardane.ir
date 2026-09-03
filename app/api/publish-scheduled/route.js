import { createAdminClient } from '../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

/**
 * GET/POST /api/publish-scheduled (also /api/cron/publish-scheduled)
 * محصولات draft با scheduled_publish_at <= now → active
 * امن: Header Authorization: Bearer CRON_SECRET  یا  ?secret=
 * بدون secret فقط در development (NODE_ENV !== production) مجاز است.
 */
async function run(request) {
  try {
    const secret = process.env.CRON_SECRET || ''
    const auth = request.headers.get('authorization') || ''
    const url = new URL(request.url)
    const q = url.searchParams.get('secret') || ''
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const ok =
      (secret && (bearer === secret || q === secret)) ||
      (!secret && process.env.NODE_ENV !== 'production')

    if (!ok) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'admin client missing' }, { status: 500 })
    }

    const nowIso = new Date().toISOString()

    const { data: due, error: selErr } = await admin
      .from('products')
      .select('id, name, status, scheduled_publish_at')
      .eq('status', 'draft')
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', nowIso)
      .limit(200)

    if (selErr) {
      return NextResponse.json({ ok: false, error: selErr.message }, { status: 400 })
    }

    const ids = (due || []).map((p) => p.id)
    if (!ids.length) {
      return NextResponse.json({ ok: true, published: 0, ids: [] })
    }

    const { data: updated, error: upErr } = await admin
      .from('products')
      .update({
        status: 'active',
        scheduled_publish_at: null,
        updated_at: nowIso,
      })
      .in('id', ids)
      .select('id, name, status')

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      published: (updated || []).length,
      ids: (updated || []).map((p) => p.id),
    })
  } catch (e) { try { await logCritical('app/api/publish-scheduled/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function GET(request) {
  return run(request)
}

export async function POST(request) {
  return run(request)
}
