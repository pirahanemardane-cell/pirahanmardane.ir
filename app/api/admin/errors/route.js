import { createAdminClient } from '../../../../lib/supabase/admin'
import { requireAdmin } from '../../../../lib/api/admin-guard'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = createAdminClient()
    const url = new URL(request.url)
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)))

    // ترجیح: critical_logs / app_errors
    for (const table of ['critical_logs', 'app_errors', 'error_logs']) {
      const { data, error } = await admin
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (!error) {
        return NextResponse.json({ ok: true, items: data || [], source: table })
      }
      if (!/relation|does not exist|42P01/i.test(error.message || '')) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      }
    }
    return NextResponse.json({ ok: true, items: [], source: null, note: 'جدول لاگ خطا یافت نشد' })
  } catch (e) {
    try {
      await logCritical('app/api/admin/errors/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
