/**
 * Storage Service — independent layer
 * Prefer Cloudflare R2; fall back to Supabase Storage.
 */
import { randomUUID } from 'crypto'
import { isR2Configured, r2PutObject } from './r2-adapter'
import { supabasePutObject } from './supabase-adapter'

/**
 * Build object key: {sellerId}/{productId}/{uuid}{suffix}.webp
 */
export function buildImageKey(meta = {}, suffix = '') {
  const sid = String(meta.sellerId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'anon'
  const pid = String(meta.productId || 'new').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'new'
  const id = randomUUID()
  return `${sid}/${pid}/${id}${suffix}.webp`
}

/**
 * @param {Buffer} buffer
 * @param {{ sellerId?: string, productId?: string, admin?: any, suffix?: string, contentType?: string }} opts
 * @returns {Promise<string>} public URL
 */
export async function storagePut(buffer, opts = {}) {
  const key = buildImageKey(opts, opts.suffix || '')
  const contentType = opts.contentType || 'image/webp'

  if (isR2Configured()) {
    return r2PutObject(buffer, key, contentType)
  }
  if (!opts.admin) {
    throw new Error('R2 تنظیم نشده و client سوپابیس برای fallback موجود نیست')
  }
  return supabasePutObject(opts.admin, buffer, key, contentType)
}

export { isR2Configured }
export { MAX_IMAGES_PER_PRODUCT, MAX_INPUT_BYTES, IMAGE_VARIANTS } from './constants'
