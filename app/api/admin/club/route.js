import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/api/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const { searchParams } = new URL(request.url)
    const q = String(searchParams.get('q') || '').replace(/\D/g, '')
    const limit = Math.min(500, Math.max(1, Number(searchParams.get('limit')) || 200))
    let query = gate.admin
      .from('customer_club')
      .select('id, phone, phone_normalized, source, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (q) query = query.ilike('phone_normalized', `%${q}%`)
    const { data, error } = await query
    if (error) return NextResponse.json({ ok: false, error: error.message || 'خطا' }, { status: 400 })
    return NextResponse.json({ ok: true, items: data || [], count: (data || []).length })
  } catch {
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (!id) return NextResponse.json({ ok: false, error: 'id لازم است' }, { status: 400 })
    const { error } = await gate.admin.from('customer_club').delete().eq('id', id)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'خطای سرور' }, { status: 500 })
  }
}
