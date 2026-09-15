import { createAdminClient } from '../supabase/admin'

/** @param {{ actorId?: string|null, action: string, entityType: string, entityId?: string|null, before?: any, after?: any, meta?: any }} p */
export async function writeAdminAudit(p) {
  try {
    const admin = createAdminClient()
    await admin.from('admin_audit_logs').insert({
      actor_id: p.actorId || null,
      action: String(p.action || '').slice(0, 120),
      entity_type: String(p.entityType || '').slice(0, 80),
      entity_id: p.entityId != null ? String(p.entityId).slice(0, 120) : null,
      before: p.before ?? null,
      after: p.after ?? null,
      meta: p.meta ?? {},
    })
  } catch (_) {
    /* never block main flow */
  }
}
