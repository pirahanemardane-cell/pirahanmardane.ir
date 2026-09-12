import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'
import { clientIp, rateLimitAsync, rateLimitResponse } from '../../../lib/rate-limit'

export async function POST(req) {
  try {
    const ip = clientIp(req)
    const rl = await rateLimitAsync('client-error:' + ip, { limit: 30, windowMs: 60 * 1000 })
    if (!rl.ok) return rateLimitResponse(rl, 'too many')

    const body = await req.json().catch(() => ({}))
    const source = String(body.source || 'client').slice(0, 120)
    const message = String(body.message || 'client error').slice(0, 2000)
    await logCritical(source, message, {
      stack: String(body.stack || '').slice(0, 1500),
      href: String(body.href || '').slice(0, 300),
      ip,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
