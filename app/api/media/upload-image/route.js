import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import {
  parseImageDataUrl,
  processAndUploadProductImage,
  MAX_INPUT_BYTES,
} from '../../../../lib/product-image-persist'

/**
 * POST /api/media/upload-image — auth + role gate
 * seller/admin: آزاد | buyer: فقط folder=users
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false, error: 'پیکربندی ناقص' }, { status: 500 })
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ ok: false, error: 'وارد نشده‌اید' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const dataUrl = body.dataUrl || body.image || ''
    const parsed = parseImageDataUrl(dataUrl)
    if (!parsed) {
      return NextResponse.json({ ok: false, error: 'داده تصویر نامعتبر است (WebP/JPEG/PNG، حداکثر ۲ مگابایت پس از فشرده‌سازی)' }, { status: 400 })
    }
    if (parsed.buffer.length > MAX_INPUT_BYTES) {
      return NextResponse.json({ ok: false, error: 'حجم تصویر بیش از حد مجاز است (حداکثر ۲ مگابایت)' }, { status: 400 })
    }

    const admin = createAdminClient()
    let role = 'buyer'
    try {
      const { data: prof } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
      role = String(prof?.role || 'buyer').toLowerCase()
    } catch (_) {}

    let folder = String(body.folder || body.role || 'users')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 32) || 'users'

    // خریدار فقط users؛ فروشنده/ادمین آزادتر
    if (!['seller', 'admin', 'superadmin'].includes(role)) {
      folder = 'users'
    }

    const result = await processAndUploadProductImage(admin, parsed.buffer, {
      sellerId: folder,
      productId: String(user.id).slice(0, 12),
    })
    return NextResponse.json({
      ok: true,
      url: result.url,
      thumbUrl: result.thumbUrl,
      bytes: result.bytes,
    })
  } catch (e) {
    try { await logCritical('media-upload', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: 'آپلود ناموفق' }, { status: 500 })
  }
}
