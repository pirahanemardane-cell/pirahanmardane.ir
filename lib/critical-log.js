/**
 * Critical error logger — console + DB (optional) + admin SMS (optional)
 */
export async function logCritical(source, err, meta = {}) {
  const message = err?.message || String(err || 'unknown')
  const payload = {
    source: String(source || 'unknown').slice(0, 120),
    message: message.slice(0, 2000),
    meta: meta && typeof meta === 'object' ? meta : {},
    at: new Date().toISOString(),
  }

  try {
    console.error('[critical]', payload.source, payload.message)
  } catch (_) {}

  try {
    const { createAdminClient } = await import('./supabase/admin')
    const admin = createAdminClient()
    if (admin) {
      const { error } = await admin.from('critical_logs').insert({
        source: payload.source,
        message: payload.message,
        meta: payload.meta,
        created_at: payload.at,
      })
      if (error) {
        try {
          console.error('[critical] db_insert_failed', String(error.message || error).slice(0, 200))
        } catch (_) {}
      }
    }
  } catch (_) {
    // table may not exist
  }

  try {
    const mod = await import('./sms/events')
    if (typeof mod.smsAdminCritical === 'function') {
      await mod.smsAdminCritical(payload.message, payload.at)
    }
  } catch (_) {}
}
