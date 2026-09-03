import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { requireAdmin } from '../../../../lib/api/admin-guard'

/** جداول اصلی قابل بک‌آپ / بازگردانی (به ترتیب وابستگی برای restore) */
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

export async function GET() {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = gate.admin
    const dump = {
      magic: MAGIC,
      site: SITE,
      version: 1,
      exported_at: new Date().toISOString(),
      tables: {},
    }

    for (const table of TABLES) {
      try {
        const { data, error } = await admin.from(table).select('*').limit(5000)
        if (error) {
          dump.tables[table] = { error: error.message, count: 0, rows: [] }
        } else {
          dump.tables[table] = { count: (data || []).length, rows: data || [] }
        }
      } catch (e) {
        try {
          await logCritical('app/api/admin/backup/route.js', e)
        } catch (_lc) {}
        dump.tables[table] = { error: String(e?.message || e), count: 0, rows: [] }
      }
    }

    return NextResponse.json({ ok: true, backup: dump })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

/**
 * POST — بازگردانی از فایل بک‌آپ سرور
 * body: { backup: { magic, site, tables }, mode?: 'upsert' }
 * فقط upsert بر اساس id؛ حذف کامل جداول انجام نمی‌شود.
 */
export async function POST(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const admin = gate.admin

    const body = await request.json().catch(() => ({}))
    const backup = body.backup || body
    if (!backup || typeof backup !== 'object') {
      return NextResponse.json({ ok: false, error: 'بدنهٔ بک‌آپ نامعتبر است' }, { status: 400 })
    }
    if (backup.magic !== MAGIC && backup.site !== SITE) {
      // پذیرش بک‌آپ‌های قدیمی فقط-جداول بدون magic
      if (!backup.tables || typeof backup.tables !== 'object') {
        return NextResponse.json(
          { ok: false, error: 'این فایل بک‌آپ سرور پیراهن مردانه نیست' },
          { status: 400 },
        )
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
      let errors = []
      // batch 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50)
        try {
          const { error, count } = await admin.from(table).upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: false,
            count: 'exact',
          })
          if (error) {
            errors.push(error.message)
            // fallback: row by row
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
      report[table] = {
        upserted,
        total: rows.length,
        errors: errors.slice(0, 5),
      }
    }

    return NextResponse.json({ ok: true, report })
  } catch (e) {
    try {
      await logCritical('app/api/admin/backup/route.js:POST', e)
    } catch (_lc) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
