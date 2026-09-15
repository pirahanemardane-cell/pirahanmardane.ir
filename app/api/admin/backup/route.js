import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdminSensitive } from '../../../../lib/api/admin-guard'
import { clientIp, rateLimitAsync, rateLimitResponse } from '../../../../lib/rate-limit'

const TABLES = [
  'profiles',
  'sellers',
  'catalog_categories',
  'catalog_brands',
  'catalog_colors',
  'catalog_sizes',
  'catalog_attributes',
  'products',
  'orders',
  'order_items',
  'tickets',
  'ticket_messages',
  'blog_posts',
  'coupons',
  'site_settings',
  'shipping_methods',
  'addresses',
  'wishlist',
  'notifications',
]

const MAGIC = 'PM-SERVER-BACKUP-v1'
const SITE = 'pirahanemardane'
const ROW_LIMIT = Number(process.env.ADMIN_BACKUP_ROW_LIMIT || 2000)

export async function GET(req) {
  try {
    const gate = await requireAdminSensitive()
    if (gate.error) return gate.error

    const ip = clientIp(req)
    const rl = await rateLimitAsync('admin-backup:' + gate.user.id, { limit: 3, windowMs: 60 * 60 * 1000 })
    if (!rl.ok) return rateLimitResponse(rl, 'حداکثر ۳ بک‌آپ در ساعت')

    const admin = gate.admin
    const dump = {
      magic: MAGIC,
      site: SITE,
      version: 2,
      exported_at: new Date().toISOString(),
      exported_by: gate.user.id,
      tables: {},
    }

    for (const table of TABLES) {
      try {
        const { data, error } = await admin.from(table).select('*').limit(ROW_LIMIT)
        if (error) {
          dump.tables[table] = { error: error.message, count: 0, rows: [] }
        } else {
          dump.tables[table] = { count: (data || []).length, rows: data || [] }
        }
      } catch (e) {
        try { await logCritical('admin/backup GET', e) } catch (_) {}
        dump.tables[table] = { error: String(e?.message || e), count: 0, rows: [] }
      }
    }

    try {
      await logCritical('admin/backup', 'BACKUP_DOWNLOAD', {
        userId: gate.user.id,
        phone: String(gate.profile?.phone || '').slice(0, 4) + '****',
        ip,
      })
    } catch (_) {}

    return NextResponse.json({ ok: true, backup: dump })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const gate = await requireAdminSensitive()
    if (gate.error) return gate.error

    const ip = clientIp(request)
    const rl = await rateLimitAsync('admin-restore:' + gate.user.id, { limit: 2, windowMs: 60 * 60 * 1000 })
    if (!rl.ok) return rateLimitResponse(rl, 'حداکثر ۲ بازگردانی در ساعت')

    const admin = gate.admin
    const body = await request.json().catch(() => ({}))
    const backup = body.backup || body
    if (!backup || typeof backup !== 'object') {
      return NextResponse.json({ ok: false, error: 'بدنهٔ بک‌آپ نامعتبر است' }, { status: 400 })
    }
    if (backup.magic !== MAGIC && backup.site !== SITE) {
      if (!backup.tables || typeof backup.tables !== 'object') {
        return NextResponse.json({ ok: false, error: 'این فایل بک‌آپ سرور پیراهن مردانه نیست' }, { status: 400 })
      }
    }

    const tables = backup.tables || {}
    const report = {}

    for (const table of TABLES) {
      const chunk = tables[table]
      if (!chunk || !Array.isArray(chunk.rows) || !chunk.rows.length) {
        report[table] = { skipped: true, reason: chunk?.error || 'empty' }
        continue
      }
      const rows = chunk.rows.filter((r) => r && typeof r === 'object')
      if (!rows.length) {
        report[table] = { skipped: true, reason: 'no valid rows' }
        continue
      }

      let upserted = 0
      const errors = []
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50)
        try {
          const { error } = await admin.from(table).upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: false,
          })
          if (error) {
            errors.push(error.message)
            for (const row of batch) {
              try {
                const { error: e2 } = await admin.from(table).upsert(row, { onConflict: 'id' })
                if (e2) errors.push(e2.message)
                else upserted += 1
              } catch (e3) {
                errors.push(String(e3?.message || e3))
              }
            }
          } else {
            upserted += batch.length
          }
        } catch (e) {
          errors.push(String(e?.message || e))
        }
      }
      report[table] = { upserted, total: rows.length, errors: errors.slice(0, 5) }
    }

    try {
      await logCritical('admin/backup', 'BACKUP_RESTORE', {
        userId: gate.user.id,
        ip,
      })
    } catch (_) {}

    return NextResponse.json({ ok: true, report })
  } catch (e) {
    try { await logCritical('admin/backup POST', e) } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
