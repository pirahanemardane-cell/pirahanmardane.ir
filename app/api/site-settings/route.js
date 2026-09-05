import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { requireAdmin } from '../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'

function dbClient() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

export async function GET(request) {
  try {
    const key = new URL(request.url).searchParams.get('key')
    let db = dbClient()
    if (!db) {
      db = await createClient()
    }
    if (!db) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })

    if (key) {
      const { data, error } = await db.from('site_settings').select('key, value, updated_at').eq('key', key).maybeSingle()
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, key, value: data?.value ?? null })
    }

    const { data, error } = await db.from('site_settings').select('key, value, updated_at')
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    const map = {}
    for (const row of data || []) map[row.key] = row.value
    return NextResponse.json({ ok: true, settings: map })
  } catch (e) { try { await logCritical('app/api/site-settings/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** PUT body: { key, value } or { settings: { key: value } } */
export async function PUT(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const entries = body.settings && typeof body.settings === 'object'
      ? Object.entries(body.settings)
      : body.key
        ? [[String(body.key), body.value]]
        : []
    if (!entries.length) return NextResponse.json({ ok: false, error: 'key/value لازم است' }, { status: 400 })

    for (const [key, value] of entries) {
      const { error } = await admin.from('site_settings').upsert({
        key: String(key).slice(0, 80),
        value: value ?? {},
        updated_at: new Date().toISOString(),
        updated_by: gate.user?.id || null,
      })
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
