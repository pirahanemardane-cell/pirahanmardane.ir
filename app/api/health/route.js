import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const started = Date.now()
  const checks = {
    app: 'ok',
    supabase_env: 'fail',
    supabase_auth: 'skip',
    db: 'skip',
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && anon) checks.supabase_env = 'ok'

  try {
    const supabase = await createClient()
    if (!supabase) {
      checks.supabase_auth = 'no_client'
    } else {
      const { error } = await supabase.auth.getSession()
      checks.supabase_auth = error ? 'warn' : 'ok'
    }
  } catch (e) {
    checks.supabase_auth = 'error'
    checks.supabase_auth_detail = String(e?.message || e).slice(0, 120)
  }

  // DB probe: جدول عمومی products (نه categories که RLS روی is_admin گیر می‌دهد)
  // 1) anon/session client
  // 2) اگر نشد → service_role (فقط سرور) برای تشخیص زنده بودن DB
  try {
    let probed = false
    try {
      const supabase = await createClient()
      if (supabase) {
        const { error } = await supabase.from('products').select('id').limit(1)
        if (!error) {
          checks.db = 'ok'
          checks.db_via = 'user_client'
          probed = true
        } else {
          checks.db_user_detail = String(error.message || error).slice(0, 120)
        }
      }
    } catch (e) {
      checks.db_user_detail = String(e?.message || e).slice(0, 120)
    }

    if (!probed) {
      try {
        const admin = createAdminClient()
        const { error } = await admin.from('products').select('id').limit(1)
        if (!error) {
          checks.db = 'ok'
          checks.db_via = 'admin_client'
          probed = true
        } else {
          checks.db = 'error'
          checks.db_detail = String(error.message || error).slice(0, 120)
        }
      } catch (e) {
        checks.db = 'error'
        checks.db_detail = String(e?.message || e).slice(0, 120)
      }
    }
  } catch (e) {
    checks.db = 'error'
    checks.db_detail = String(e?.message || e).slice(0, 120)
  }

  const criticalFail =
    checks.supabase_env !== 'ok' || checks.db === 'error' || checks.app !== 'ok'

  if (criticalFail) {
    try {
      await logCritical('health', new Error('health_check_failed'), { checks })
    } catch (_) {}
  }

  const rateLimitBackend = process.env.UPSTASH_REDIS_REST_URL
    ? 'upstash'
    : 'memory_or_db'

  return NextResponse.json(
    {
      ok: !criticalFail,
      service: 'pirahanemardane',
      version: process.env.npm_package_version || '0.0.0',
      region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown',
      deployment: process.env.VERCEL_GIT_COMMIT_SHA
        ? String(process.env.VERCEL_GIT_COMMIT_SHA).slice(0, 7)
        : undefined,
      time: new Date().toISOString(),
      latency_ms: Date.now() - started,
      rate_limit_backend: rateLimitBackend,
      checks,
    },
    {
      status: criticalFail ? 503 : 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  )
}
