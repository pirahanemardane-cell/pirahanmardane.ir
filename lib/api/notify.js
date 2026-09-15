import { createAdminClient } from '../supabase/admin'

/**
 * Insert a user notification (service role). Never throws.
 * @param {{ userId: string, title: string, body?: string, type?: string, meta?: object }} p
 */
export async function notifyUser(p) {
  try {
    if (!p?.userId || !p?.title) return
    const admin = createAdminClient()
    await admin.from('user_notifications').insert({
      user_id: p.userId,
      title: String(p.title).slice(0, 200),
      body: p.body != null ? String(p.body).slice(0, 2000) : null,
      type: p.type || 'info',
      read: false,
      meta: p.meta || {},
    })
  } catch (_) {
    /* non-blocking */
  }
}
