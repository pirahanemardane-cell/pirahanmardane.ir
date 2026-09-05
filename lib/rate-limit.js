/**
 * Rate limit: Upstash Redis → جدول Supabase → حافظه
 */
import { NextResponse } from 'next/server'

const buckets = new Map()

function now() {
  return Date.now()
}

function cleanup(maxEntries = 5000) {
  if (buckets.size < maxEntries) return
  const t = now()
  for (const [k, v] of buckets) {
    if (v.resetAt <= t) buckets.delete(k)
  }
  if (buckets.size >= maxEntries) {
    const arr = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)
    for (let i = 0; i < Math.min(500, arr.length); i++) buckets.delete(arr[i][0])
  }
}

function memoryLimit(key, limit, windowMs) {
  const k = String(key || 'unknown').slice(0, 200)
  const t = now()
  cleanup()
  let b = buckets.get(k)
  if (!b || b.resetAt <= t) {
    b = { count: 0, resetAt: t + windowMs }
    buckets.set(k, b)
  }
  b.count += 1
  const remaining = Math.max(0, limit - b.count)
  const retryAfterSec = Math.max(1, Math.ceil((b.resetAt - t) / 1000))
  if (b.count > limit) return { ok: false, remaining: 0, retryAfterSec, limit }
  return { ok: true, remaining, retryAfterSec: 0, limit }
}

async function upstashLimit(key, limit, windowMs) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  const k = 'rl:' + String(key).slice(0, 180)
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  try {
    const res = await fetch(url + '/pipeline', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', k],
        ['EXPIRE', k, windowSec],
        ['TTL', k],
      ]),
    })
    if (!res.ok) return null
    const data = await res.json()
    const count = Number(data?.[0]?.result ?? data?.[0])
    const ttl = Number(data?.[2]?.result ?? data?.[2] ?? windowSec)
    if (!Number.isFinite(count)) return null
    const remaining = Math.max(0, limit - count)
    const retryAfterSec = Math.max(1, ttl > 0 ? ttl : windowSec)
    if (count > limit) return { ok: false, remaining: 0, retryAfterSec, limit }
    return { ok: true, remaining, retryAfterSec: 0, limit }
  } catch {
    return null
  }
}

async function dbLimit(key, limit, windowMs) {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const k = String(key).slice(0, 200)
    const t = now()
    const { data: row } = await admin
      .from('rate_limit_buckets')
      .select('key, count, reset_at')
      .eq('key', k)
      .maybeSingle()

    let count = 0
    let resetAt = t + windowMs
    if (row && new Date(row.reset_at).getTime() > t) {
      count = Number(row.count) || 0
      resetAt = new Date(row.reset_at).getTime()
    }
    count += 1
    await admin.from('rate_limit_buckets').upsert({
      key: k,
      count,
      reset_at: new Date(resetAt).toISOString(),
      updated_at: new Date().toISOString(),
    })
    const remaining = Math.max(0, limit - count)
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - t) / 1000))
    if (count > limit) return { ok: false, remaining: 0, retryAfterSec, limit }
    return { ok: true, remaining, retryAfterSec: 0, limit }
  } catch {
    return null
  }
}

export function rateLimit(key, opts = {}) {
  if (process.env.RATE_LIMIT_DISABLED === 'true' || process.env.RATE_LIMIT_DISABLED === '1') {
    return { ok: true, remaining: 999, retryAfterSec: 0, limit: 999 }
  }
  const limit = Math.max(1, Number(opts.limit) || 10)
  const windowMs = Math.max(1000, Number(opts.windowMs) || (Number(opts.window) ? Number(opts.window) * 1000 : 60000))
  return memoryLimit(key, limit, windowMs)
}

export async function rateLimitAsync(key, opts = {}) {
  if (process.env.RATE_LIMIT_DISABLED === 'true' || process.env.RATE_LIMIT_DISABLED === '1') {
    return { ok: true, remaining: 999, retryAfterSec: 0, limit: 999 }
  }
  const limit = Math.max(1, Number(opts.limit) || 10)
  const windowMs = Math.max(1000, Number(opts.windowMs) || (Number(opts.window) ? Number(opts.window) * 1000 : 60000))
  const viaUpstash = await upstashLimit(key, limit, windowMs)
  if (viaUpstash) return viaUpstash
  const viaDb = await dbLimit(key, limit, windowMs)
  if (viaDb) return viaDb
  return memoryLimit(key, limit, windowMs)
}

export const RATE_POLICIES = {
  otp_phone: { limit: 5, windowMs: 15 * 60 * 1000 },
  otp_ip: { limit: 20, windowMs: 15 * 60 * 1000 },
  login_id: { limit: 10, windowMs: 15 * 60 * 1000 },
  login_ip: { limit: 30, windowMs: 15 * 60 * 1000 },
  order_user: { limit: 20, windowMs: 60 * 60 * 1000 },
  pay_user: { limit: 30, windowMs: 60 * 60 * 1000 },
  api_ip: { limit: 120, windowMs: 60 * 1000 },
  mfa: { limit: 8, windowMs: 15 * 60 * 1000 },
}

export function clientIp(request) {
  try {
    const h = request?.headers
    if (!h) return 'unknown'
    const xf = h.get?.('x-forwarded-for') || h.get?.('x-real-ip') || ''
    const first = String(xf).split(',')[0].trim()
    if (first) return first.slice(0, 64)
    return (h.get?.('cf-connecting-ip') || 'unknown').slice(0, 64)
  } catch {
    return 'unknown'
  }
}

export function rateLimitResponse(rl, message) {
  const msg = message || 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.'
  const body = typeof rl === 'object' && rl ? rl : { retryAfterSec: Number(rl) || 60, limit: 0, remaining: 0 }
  return NextResponse.json(
    { ok: false, error: msg, code: 'RATE_LIMITED', retry_after: body.retryAfterSec },
    {
      status: 429,
      headers: {
        'Retry-After': String(body.retryAfterSec || 60),
        'X-RateLimit-Limit': String(body.limit || 0),
        'X-RateLimit-Remaining': String(body.remaining || 0),
      },
    }
  )
}

export function enforceRateLimits(checks) {
  for (const c of checks || []) {
    const rl = rateLimit(c.key, c.policy || RATE_POLICIES.api_ip)
    if (!rl.ok) return { ok: false, response: rateLimitResponse(rl, c.message) }
  }
  return { ok: true }
}

export async function enforceRateLimitsAsync(checks) {
  for (const c of checks || []) {
    const rl = await rateLimitAsync(c.key, c.policy || RATE_POLICIES.api_ip)
    if (!rl.ok) return { ok: false, response: rateLimitResponse(rl, c.message) }
  }
  return { ok: true }
}
