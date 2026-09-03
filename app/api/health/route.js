import { NextResponse } from 'next/server'
import { logCritical } from '../../../lib/critical-log'
import { createClient } from '../../../lib/supabase/server'

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
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (url && anon) checks.supabase_env = 'ok'
  checks.service_role = service ? 'ok' : 'missing'

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

  try {
    const supabase = await createClient()
    if (supabase) {
      const { error } = await supabase.from('categories').select('id').limit(1)
      checks.db = error ? 'error' : 'ok'
      if (error) checks.db_detail = String(error.message || error).slice(0, 120)
    }
  } catch (e) {
    checks.db = 'error'
    checks.db_detail = String(e?.message || e).slice(0, 120)
  }

  const criticalFail =
    checks.supabase_env !== 'ok' || checks.db === 'error' || checks.app !== 'ok'

  return NextResponse.json(
    {
      ok: !criticalFail,
      service: 'pirahanemardane',
      version: process.env.npm_package_version || '0.0.0',
      time: new Date().toISOString(),
      latency_ms: Date.now() - started,
      checks,
    },
    {
      status: criticalFail ? 503 : 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  )
}
