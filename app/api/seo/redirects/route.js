import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/api/admin-guard'

const KEY = 'seo_redirects'

async function loadList() {
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('site_settings').select('value').eq('key', KEY).maybeSingle()
    const v = data?.value
    if (Array.isArray(v)) return v
    if (v && typeof v === 'object' && Array.isArray(v.items)) return v.items
  } catch (_) {}
  return []
}

async function saveList(list) {
  const admin = createAdminClient()
  const clean = (Array.isArray(list) ? list : [])
    .map((r) => ({
      from: String(r.from || '').trim(),
      to: String(r.to || '').trim(),
      type: ['301', '302', '410'].includes(String(r.type)) ? String(r.type) : '301',
    }))
    .filter((r) => r.from)
  const { error } = await admin.from('site_settings').upsert(
    { key: KEY, value: clean, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
  if (error) throw new Error(error.message)
  return clean
}

export async function GET() {
  try {
    const list = await loadList()
    return NextResponse.json({ ok: true, redirects: list, count: list.length })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const list = await saveList(body?.redirects || body || [])
    return NextResponse.json({ ok: true, count: list.length, redirects: list })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  return PUT(request)
}
