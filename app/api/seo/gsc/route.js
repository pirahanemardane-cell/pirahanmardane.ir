import { logCritical } from '../../../../lib/critical-log'
import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/api/admin-guard'

function gscConfigured() {
  return !!(process.env.GSC_CLIENT_ID && process.env.GSC_CLIENT_SECRET && process.env.GSC_REFRESH_TOKEN)
}

/** GET — وضعیت اتصال GSC (بدون داده ساختگی) */
export async function GET() {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const configured = gscConfigured()
    return NextResponse.json({
      ok: true,
      connected: configured,
      siteUrl: process.env.GSC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || null,
      rows: [],
      message: configured
        ? 'اعتبار GSC در env موجود است'
        : 'GSC پیکربندی نشده — GSC_CLIENT_ID / SECRET / REFRESH_TOKEN',
    })
  } catch (e) {
    try {
      await logCritical('seo/gsc', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/** POST action=query — فقط اگر واقعاً configured؛ وگرنه 503 بدون داده فیک */
export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error

    const body = await request.json().catch(() => ({}))
    const action = body?.action || 'status'

    if (!gscConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          connected: false,
          rows: [],
          error: 'GSC پیکربندی نشده',
        },
        { status: 503 },
      )
    }

    if (action === 'status' || action === 'test') {
      return NextResponse.json({
        ok: true,
        connected: true,
        rows: [],
        message: 'env آماده است — فراخوانی Search Analytics در لایه جدا قابل اتصال است',
      })
    }

    return NextResponse.json({ ok: false, error: 'action نامعتبر' }, { status: 400 })
  } catch (e) {
    try {
      await logCritical('seo/gsc', e)
    } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
