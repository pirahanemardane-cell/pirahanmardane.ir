/**
 * Realtime سراسری — Supabase postgres_changes
 * همه جداول حیاتی را subscribe می‌کند و رویداد یکسان روی window می‌فرستد.
 *
 * رویداد: window 'pm:db'  detail: { table, event, row, old }
 * همچنین 'pm:invalidate' detail: { scope: 'catalog'|'orders'|'tickets'|'notifications'|'sellers'|'cart' }
 *
 * پیش‌نیاز Supabase Dashboard:
 *   Database → Publications → supabase_realtime → جداول زیر را Add کنید
 *   (یا sql/realtime-publication.sql را در SQL Editor اجرا کنید)
 */
'use client'

export const REALTIME_TABLES = [
  'products',
  'product_variants',
  'orders',
  'order_items',
  'order_returns',
  'sellers',
  'profiles',
  'user_notifications',
  'carts',
  'cart_items',
  'wishlists',
  'coupons',
  'campaigns',
  'catalog_categories',
  'catalog_brands',
  'catalog_colors',
  'catalog_sizes',
  'catalog_tags',
  'catalog_attributes',
  'reviews',
  'seller_payout_requests',
  'site_settings',
  'support_tickets',
]

const TABLE_SCOPE = {
  products: 'catalog',
  product_variants: 'catalog',
  catalog_categories: 'catalog',
  catalog_brands: 'catalog',
  catalog_colors: 'catalog',
  catalog_sizes: 'catalog',
  catalog_tags: 'catalog',
  catalog_attributes: 'catalog',
  orders: 'orders',
  order_items: 'orders',
  order_returns: 'orders',
  sellers: 'sellers',
  profiles: 'sellers',
  user_notifications: 'notifications',
  carts: 'cart',
  cart_items: 'cart',
  wishlists: 'cart',
  coupons: 'catalog',
  campaigns: 'catalog',
  reviews: 'catalog',
  seller_payout_requests: 'orders',
  site_settings: 'settings',
  tickets: 'tickets',
}

function emit(table, event, row, old) {
  if (typeof window === 'undefined') return
  const scope = TABLE_SCOPE[table] || 'all'
  try {
    window.dispatchEvent(
      new CustomEvent('pm:db', {
        detail: { table, event, row: row || null, old: old || null, scope, ts: Date.now() },
      })
    )
    window.dispatchEvent(
      new CustomEvent('pm:invalidate', {
        detail: { scope, table, event, ts: Date.now() },
      })
    )
  } catch (_) {}
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {{ stop: () => void }}
 */
export function startGlobalRealtime(client) {
  if (!client || typeof client.channel !== 'function') {
    return { stop() {} }
  }

  const channelName = 'pm-global-realtime-v1'
  let channel = client.channel(channelName)

  for (const table of REALTIME_TABLES) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        const event = payload?.eventType || payload?.event || '*'
        const row = payload?.new && Object.keys(payload.new).length ? payload.new : null
        const old = payload?.old && Object.keys(payload.old).length ? payload.old : null
        emit(table, event, row, old)
      }
    )
  }

  channel.subscribe((status) => {
    try {
      window.dispatchEvent(
        new CustomEvent('pm:realtime-status', {
          detail: { status, ts: Date.now() },
        })
      )
    } catch (_) {}
  })

  return {
    stop() {
      try {
        client.removeChannel(channel)
      } catch (_) {}
    },
  }
}
