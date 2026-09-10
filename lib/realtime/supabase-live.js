/**
 * Realtime سراسری — Supabase postgres_changes
 * رویداد: window 'pm:db'  و  'pm:invalidate'
 *
 * پیش‌نیاز: sql/realtime-publication.sql در Supabase SQL Editor
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
  'notifications',
  'carts',
  'cart_items',
  'wishlists',
  'wishlist',
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
  'tickets',
  'ticket_messages',
  'addresses',
  'user_addresses',
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
  coupons: 'catalog',
  campaigns: 'catalog',
  reviews: 'reviews',
  orders: 'orders',
  order_items: 'orders',
  order_returns: 'orders',
  seller_payout_requests: 'payouts',
  sellers: 'sellers',
  profiles: 'sellers',
  user_notifications: 'notifications',
  notifications: 'notifications',
  carts: 'cart',
  cart_items: 'cart',
  wishlists: 'wishlist',
  wishlist: 'wishlist',
  site_settings: 'settings',
  tickets: 'tickets',
  support_tickets: 'tickets',
  ticket_messages: 'tickets',
  addresses: 'cart',
  user_addresses: 'cart',
}

function emit(table, event, row, old) {
  if (typeof window === 'undefined') return
  const scope = TABLE_SCOPE[table] || 'all'
  try {
    window.dispatchEvent(
      new CustomEvent('pm:db', {
        detail: { table, event, row: row || null, old: old || null, scope, ts: Date.now() },
      }),
    )
    window.dispatchEvent(
      new CustomEvent('pm:invalidate', {
        detail: { scope, table, event, ts: Date.now() },
      }),
    )
  } catch (_) {}
}

export function startGlobalRealtime(client) {
  if (!client || typeof client.channel !== 'function') {
    return { stop() {} }
  }

  const channelName = 'pm-global-realtime-v2'
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
      },
    )
  }

  channel.subscribe((status) => {
    try {
      window.dispatchEvent(
        new CustomEvent('pm:realtime-status', {
          detail: { status, ts: Date.now() },
        }),
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
