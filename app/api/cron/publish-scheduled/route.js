import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'

/** سازگاری: همان منطق /api/publish-scheduled */
async function forward(request) {
  const url = new URL(request.url)
  url.pathname = '/api/publish-scheduled'
  try {
    const res = await fetch(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      redirect: 'manual',
    })
    const text = await res.text()
    return new NextResponse(text, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
  } catch (e) { try { await logCritical('app/api/cron/publish-scheduled/route.js', e) } catch (_lc) {} 
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function GET(request) {
  return forward(request)
}
export async function POST(request) {
  return forward(request)
}
