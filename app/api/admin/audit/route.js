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
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10))
    const action = url.searchParams.get('action') || ''
    const entity = url.searchParams.get('entity_type') || ''

    let q = admin
      .from('admin_audit_logs')
      .select('id, actor_id, action, entity_type, entity_id, before, after, meta, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (action) q = q.eq('action', action)
    if (entity) q = q.eq('entity_type', entity)

    const { data, error, count } = await q
    if (error) {
      // جدول نباشد → لیست خالی بدون 500
      if (/relation|does not exist|42P01/i.test(error.message || '')) {
        return NextResponse.json({ ok: true, items: [], total: 0, note: 'جدول audit هنوز ساخته نشده' })
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true, items: data || [], total: count ?? (data || []).length })
  } catch (e) {
    try {
      await logCritical('app/api/admin/audit/route.js', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
