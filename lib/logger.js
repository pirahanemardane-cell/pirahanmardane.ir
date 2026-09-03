const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }

function shouldLog(level) {
  const min = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  return (LEVELS[level] || 20) >= (LEVELS[min] || 20)
}

function base(level, message, meta = {}) {
  if (!shouldLog(level)) return
  const row = {
    ts: new Date().toISOString(),
    level,
    message: String(message || ''),
    ...meta,
  }
  const line = JSON.stringify(row)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (msg, meta) => base('debug', msg, meta),
  info: (msg, meta) => base('info', msg, meta),
  warn: (msg, meta) => base('warn', msg, meta),
  error: (msg, meta) => base('error', msg, meta),
}

export function reportError(err, context = {}) {
  const message = err?.message || String(err)
  const stack = typeof err?.stack === 'string' ? err.stack.slice(0, 2000) : undefined
  logger.error(message, { ...context, stack, name: err?.name })

  // Sentry اختیاری — بدون پکیج اجباری
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (dsn && typeof fetch === 'function') {
    try {
      // ارسال مینیمال به Store API سخت است؛ فقط لاگ + هوک
      // اگر @sentry/nextjs نصب باشد:
      if (typeof globalThis !== 'undefined' && globalThis.__SENTRY__) {
        // no-op placeholder
      }
    } catch (_) {}
  }
}

export function apiErrorResponse(NextResponse, err, status = 500, publicMessage = 'خطای سرور') {
  reportError(err, { status })
  return NextResponse.json(
    {
      ok: false,
      error: process.env.NODE_ENV === 'production' ? publicMessage : err?.message || publicMessage,
    },
    { status },
  )
}
