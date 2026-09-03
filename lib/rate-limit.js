/**
 * Rate limit ساده در حافظه (per isolate)
 * برای OTP / login / APIهای حساس
 *
 * کلید: معمولاً `otp:09xxxxxxxxx` یا `ip:1.2.3.4:login`
 *
 * env:
 *   RATE_LIMIT_DISABLED=true  → خاموش (فقط dev)
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
    // حذف قدیمی‌ترین‌ها
    const arr = [...buckets.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)
    for (let i = 0; i < Math.min(500, arr.length); i++) buckets.delete(arr[i][0])
  }
}

/**
 * @param {string} key
 * @param {{ limit?: number, windowMs?: number }} opts
 * @returns {{ ok: boolean, remaining: number, retryAfterSec: number, limit: number }}
 */
export function rateLimit(key, opts = {}) {
  if (process.env.RATE_LIMIT_DISABLED === 'true' || process.env.RATE_LIMIT_DISABLED === '1') {
    return { ok: true, remaining: 999, retryAfterSec: 0, limit: 999 }
  }
  const limit = Math.max(1, Number(opts.limit) || 10)
  const windowMs = Math.max(1000, Number(opts.windowMs) || 60_000)
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
  if (b.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec, limit }
  }
  return { ok: true, remaining, retryAfterSec: 0, limit }
}

/** سیاست‌های پیش‌فرض پروژه */
export const RATE_POLICIES = {
  /** درخواست OTP — per phone */
  otp_phone: { limit: 5, windowMs: 15 * 60 * 1000 },
  /** درخواست OTP — per IP */
  otp_ip: { limit: 20, windowMs: 15 * 60 * 1000 },
  /** ورود با رمز — per phone/email */
  login_id: { limit: 10, windowMs: 15 * 60 * 1000 },
  /** ورود — per IP */
  login_ip: { limit: 30, windowMs: 15 * 60 * 1000 },
  /** ایجاد سفارش */
  order_user: { limit: 20, windowMs: 60 * 60 * 1000 },
  /** شروع پرداخت */
  pay_user: { limit: 30, windowMs: 60 * 60 * 1000 },
  /** API عمومی حساس */
  api_ip: { limit: 120, windowMs: 60 * 1000 },
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

export function rateLimitResponse(rl, message = 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.') {
  return NextResponse.json(
    { ok: false, error: message, code: 'RATE_LIMITED', retry_after: rl.retryAfterSec },
    {
      status: 429,
      headers: {
        'Retry-After': String(rl.retryAfterSec || 60),
        'X-RateLimit-Limit': String(rl.limit || 0),
        'X-RateLimit-Remaining': String(rl.remaining || 0),
      },
    }
  )
}

/**
 * بررسی چند کلید؛ اگر یکی fail شود همان برمی‌گردد
 * @returns {{ ok: true } | { ok: false, response: Response }}
 */
export function enforceRateLimits(checks) {
  for (const c of checks || []) {
    const rl = rateLimit(c.key, c.policy || RATE_POLICIES.api_ip)
    if (!rl.ok) {
      return { ok: false, response: rateLimitResponse(rl, c.message) }
    }
  }
  return { ok: true }
}
