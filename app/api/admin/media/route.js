import { NextResponse } from 'next/server'
import { requireAdmin, requireAdminSensitive } from '../../../../lib/api/admin-guard'
import { logCritical } from '../../../../lib/critical-log'

function isImg(u) {
  if (!u || typeof u !== 'string') return false
  const s = u.trim()
  if (!s || s === '/logo.webp' || s === '/default-avatar.svg') return false
  return s.startsWith('http') || s.startsWith('/') || s.startsWith('data:image')
}

function pushItem(list, item) {
  if (!item || !isImg(item.url)) return
  list.push(item)
}

function extractMsgImages(messages, base) {
  const out = []
  const arr = Array.isArray(messages) ? messages : []
  arr.forEach((m, i) => {
    if (!m || typeof m !== 'object') return
    const candidates = []
      .concat(m.image ? [m.image] : [])
      .concat(m.image_url ? [m.image_url] : [])
      .concat(m.url && /\.(webp|png|jpe?g|gif|svg)(\?|$)/i.test(String(m.url)) ? [m.url] : [])
      .concat(Array.isArray(m.attachments) ? m.attachments : [])
      .concat(Array.isArray(m.images) ? m.images : [])
    candidates.flat().forEach((u, j) => {
      const url = typeof u === 'string' ? u : (u && (u.url || u.src || u.path))
      pushItem(out, {
        ...base,
        id: `${base.parentId}-msg-${i}-${j}`,
        url: url,
        meta: { from: m.from || m.role || '', at: m.date || m.created_at || null },
      })
    })
  })
  return out
}

export async function GET(request) {
  try {
    const gate = await requireAdmin()
    if (gate.error) return gate.error
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'buyers' // buyers | sellers
    const kind = searchParams.get('kind') || 'all'
    const items = []

    if (scope === 'buyers') {
      if (kind === 'all' || kind === 'avatar') {
        const { data } = await gate.admin
          .from('profiles')
          .select('id, full_name, phone, avatar_url, avatar_pending_url, avatar_status, role, updated_at')
          .order('updated_at', { ascending: false })
          .limit(300)
        for (const p of data || []) {
          const role = String(p.role || '').toLowerCase()
          if (role === 'seller' || role === 'admin' || role === 'superadmin') continue
          pushItem(items, {
            id: `buyer-avatar-${p.id}`,
            scope: 'buyers',
            kind: 'avatar',
            url: p.avatar_url,
            pendingUrl: p.avatar_pending_url || null,
            status: p.avatar_status || null,
            ownerId: p.id,
            ownerName: p.full_name || p.phone || 'خریدار',
            field: 'avatar_url',
            table: 'profiles',
          })
          pushItem(items, {
            id: `buyer-avatar-pending-${p.id}`,
            scope: 'buyers',
            kind: 'avatar',
            url: p.avatar_pending_url,
            ownerId: p.id,
            ownerName: (p.full_name || p.phone || 'خریدار') + ' (در انتظار)',
            field: 'avatar_pending_url',
            table: 'profiles',
            status: 'pending',
          })
        }
      }
      if (kind === 'all' || kind === 'review') {
        let rows = []
        try {
          const r1 = await gate.admin
            .from('reviews')
            .select('id, user_id, product_id, display_name, display_avatar_url, body, images, photos, created_at')
            .order('created_at', { ascending: false })
            .limit(200)
          if (!r1.error) rows = r1.data || []
          else {
            const r2 = await gate.admin
              .from('reviews')
              .select('id, user_id, product_id, display_name, display_avatar_url, body, created_at')
              .order('created_at', { ascending: false })
              .limit(200)
            rows = r2.data || []
          }
        } catch (_) {}
        for (const r of rows) {
          pushItem(items, {
            id: `review-avatar-${r.id}`,
            scope: 'buyers',
            kind: 'review',
            url: r.display_avatar_url,
            ownerId: r.user_id,
            ownerName: r.display_name || 'نظر',
            field: 'display_avatar_url',
            table: 'reviews',
            rowId: r.id,
          })
          const imgs = [].concat(r.images || []).concat(r.photos || [])
          imgs.forEach((u, i) => {
            const url = typeof u === 'string' ? u : u?.url
            pushItem(items, {
              id: `review-img-${r.id}-${i}`,
              scope: 'buyers',
              kind: 'review',
              url,
              ownerId: r.user_id,
              ownerName: r.display_name || 'نظر محصول',
              field: 'images',
              table: 'reviews',
              rowId: r.id,
              index: i,
            })
          })
        }
      }
      if (kind === 'all' || kind === 'ticket') {
        try {
          const { data: tickets } = await gate.admin
            .from('tickets')
            .select('id, user_id, subject, messages, category, created_at')
            .order('created_at', { ascending: false })
            .limit(150)
          for (const t of tickets || []) {
            const imgs = extractMsgImages(t.messages, {
              scope: 'buyers',
              kind: 'ticket',
              parentId: t.id,
              ownerId: t.user_id,
              ownerName: t.subject || 'تیکت خریدار',
              table: 'tickets',
              rowId: t.id,
              field: 'messages',
            })
            items.push(...imgs)
          }
        } catch (_) {}
      }
    }

    if (scope === 'sellers') {
      if (kind === 'all' || kind === 'logo' || kind === 'banner') {
        const { data: sellers } = await gate.admin
          .from('sellers')
          .select('id, shop_name, phone, logo_url, banner_url, logo_pending_url, banner_pending_url, logo_status, banner_status')
          .order('updated_at', { ascending: false })
          .limit(200)
        for (const s of sellers || []) {
          if (kind === 'all' || kind === 'logo') {
            pushItem(items, {
              id: `seller-logo-${s.id}`,
              scope: 'sellers',
              kind: 'logo',
              url: s.logo_url,
              pendingUrl: s.logo_pending_url,
              status: s.logo_status,
              ownerId: s.id,
              ownerName: s.shop_name || s.phone || 'فروشنده',
              field: 'logo_url',
              table: 'sellers',
              rowId: s.id,
            })
            pushItem(items, {
              id: `seller-logo-pending-${s.id}`,
              scope: 'sellers',
              kind: 'logo',
              url: s.logo_pending_url,
              ownerId: s.id,
              ownerName: (s.shop_name || 'فروشنده') + ' (در انتظار)',
              field: 'logo_pending_url',
              table: 'sellers',
              rowId: s.id,
              status: 'pending',
            })
          }
          if (kind === 'all' || kind === 'banner') {
            pushItem(items, {
              id: `seller-banner-${s.id}`,
              scope: 'sellers',
              kind: 'banner',
              url: s.banner_url,
              pendingUrl: s.banner_pending_url,
              status: s.banner_status,
              ownerId: s.id,
              ownerName: s.shop_name || 'فروشنده',
              field: 'banner_url',
              table: 'sellers',
              rowId: s.id,
            })
            pushItem(items, {
              id: `seller-banner-pending-${s.id}`,
              scope: 'sellers',
              kind: 'banner',
              url: s.banner_pending_url,
              ownerId: s.id,
              ownerName: (s.shop_name || 'فروشنده') + ' (کاور در انتظار)',
              field: 'banner_pending_url',
              table: 'sellers',
              rowId: s.id,
              status: 'pending',
            })
          }
        }
      }
      if (kind === 'all' || kind === 'product') {
        const { data: products } = await gate.admin
          .from('products')
          .select('id, name, title, seller_id, cover_image, images, payload')
          .order('updated_at', { ascending: false })
          .limit(250)
        for (const p of products || []) {
          const payload = p.payload && typeof p.payload === 'object' ? p.payload : {}
          const cover = p.cover_image || payload.image || null
          pushItem(items, {
            id: `product-cover-${p.id}`,
            scope: 'sellers',
            kind: 'product',
            url: cover,
            ownerId: p.seller_id,
            ownerName: p.name || p.title || 'محصول',
            field: 'cover_image',
            table: 'products',
            rowId: p.id,
          })
          const imgs = Array.isArray(p.images) && p.images.length ? p.images : (payload.images || [])
          imgs.forEach((u, i) => {
            const url = typeof u === 'string' ? u : u?.url
            pushItem(items, {
              id: `product-img-${p.id}-${i}`,
              scope: 'sellers',
              kind: 'product',
              url,
              ownerId: p.seller_id,
              ownerName: (p.name || p.title || 'محصول') + ` #${i + 1}`,
              field: 'images',
              table: 'products',
              rowId: p.id,
              index: i,
            })
          })
        }
      }
      if (kind === 'all' || kind === 'ticket') {
        try {
          const { data: tickets } = await gate.admin
            .from('tickets')
            .select('id, user_id, seller_id, subject, messages, category, created_at')
            .not('seller_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(150)
          for (const t of tickets || []) {
            const imgs = extractMsgImages(t.messages, {
              scope: 'sellers',
              kind: 'ticket',
              parentId: t.id,
              ownerId: t.seller_id || t.user_id,
              ownerName: t.subject || 'تیکت فروشنده',
              table: 'tickets',
              rowId: t.id,
              field: 'messages',
            })
            items.push(...imgs)
          }
        } catch (_) {}
      }
    }

    return NextResponse.json({ ok: true, items, count: items.length })
  } catch (e) {
    try { await logCritical('app/api/admin/media/route.js:GET', e) } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const gate = await requireAdminSensitive()
    if (gate.error) return gate.error
    const body = await request.json().catch(() => ({}))
    const action = String(body.action || 'delete').toLowerCase()
    const table = String(body.table || '')
    const rowId = body.rowId || body.ownerId || body.id
    const field = String(body.field || '')
    const newUrl = body.url != null ? String(body.url) : null

    if (!table || !rowId || !field) {
      return NextResponse.json({ ok: false, error: 'table/rowId/field لازم است' }, { status: 400 })
    }

    if (action === 'delete' || action === 'clear') {
      if (field === 'images' && table === 'products') {
        const { data: cur } = await gate.admin.from('products').select('images, payload').eq('id', rowId).maybeSingle()
        const imgs = Array.isArray(cur?.images) ? [...cur.images] : []
        const idx = Number(body.index)
        if (Number.isFinite(idx) && idx >= 0 && idx < imgs.length) imgs.splice(idx, 1)
        const payload = { ...(cur?.payload || {}), images: imgs }
        const { error } = await gate.admin.from('products').update({ images: imgs, payload, updated_at: new Date().toISOString() }).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      if (field === 'cover_image' && table === 'products') {
        const { error } = await gate.admin.from('products').update({ cover_image: null, updated_at: new Date().toISOString() }).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      if (table === 'profiles') {
        const patch = { updated_at: new Date().toISOString() }
        patch[field] = null
        if (field === 'avatar_url') patch.avatar_status = 'none'
        if (field === 'avatar_pending_url') patch.avatar_status = 'none'
        const { error } = await gate.admin.from('profiles').update(patch).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      if (table === 'sellers') {
        const patch = { updated_at: new Date().toISOString() }
        patch[field] = null
        if (field === 'logo_url') patch.logo_status = 'none'
        if (field === 'banner_url') patch.banner_status = 'none'
        if (field === 'logo_pending_url') patch.logo_status = 'none'
        if (field === 'banner_pending_url') patch.banner_status = 'none'
        const { error } = await gate.admin.from('sellers').update(patch).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      if (table === 'reviews' && field === 'display_avatar_url') {
        const { error } = await gate.admin.from('reviews').update({ display_avatar_url: null, updated_at: new Date().toISOString() }).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ ok: false, error: 'حذف برای این نوع پشتیبانی نشد' }, { status: 400 })
    }

    if (action === 'update' || action === 'replace') {
      if (!newUrl) return NextResponse.json({ ok: false, error: 'url لازم است' }, { status: 400 })
      if (table === 'profiles') {
        const { error } = await gate.admin.from('profiles').update({ [field]: newUrl, updated_at: new Date().toISOString() }).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      if (table === 'sellers') {
        const { error } = await gate.admin.from('sellers').update({ [field]: newUrl, updated_at: new Date().toISOString() }).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      if (table === 'products' && field === 'cover_image') {
        const { error } = await gate.admin.from('products').update({ cover_image: newUrl, updated_at: new Date().toISOString() }).eq('id', rowId)
        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ ok: false, error: 'ویرایش برای این نوع پشتیبانی نشد' }, { status: 400 })
    }

    return NextResponse.json({ ok: false, error: 'action نامعتبر' }, { status: 400 })
  } catch (e) {
    try { await logCritical('app/api/admin/media/route.js:PATCH', e) } catch (_) {}
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
