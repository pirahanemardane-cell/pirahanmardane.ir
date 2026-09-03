/**
 * Product images pipeline:
 * parse → Sharp (large + thumb) → Storage Service (R2 or Supabase) → public URLs
 */
import { processProductImageBuffer } from './image-process'
import { MAX_IMAGES_PER_PRODUCT, MAX_INPUT_BYTES } from './storage'

export { MAX_IMAGES_PER_PRODUCT, MAX_INPUT_BYTES }

/** @returns {{ mime: string, buffer: Buffer } | null} */
export function parseWebpDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const m = dataUrl.match(/^data:(image\/webp);base64,([A-Za-z0-9+/=\s]+)$/i)
  if (!m) return null
  try {
    const buffer = Buffer.from(m[2].replace(/\s/g, ''), 'base64')
    if (!buffer.length || buffer.length > MAX_INPUT_BYTES) return null
    if (buffer.length >= 12) {
      const riff = buffer.toString('ascii', 0, 4)
      const webp = buffer.toString('ascii', 8, 12)
      if (riff !== 'RIFF' || webp !== 'WEBP') return null
    }
    return { mime: 'image/webp', buffer }
  } catch {
    return null
  }
}

/** Accept WebP data URL or common image data URLs (server will re-encode with Sharp) */
export function parseImageDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const webp = parseWebpDataUrl(dataUrl)
  if (webp) return webp
  const m = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i)
  if (!m) return null
  try {
    const buffer = Buffer.from(m[2].replace(/\s/g, ''), 'base64')
    if (!buffer.length || buffer.length > MAX_INPUT_BYTES) return null
    return { mime: m[1].toLowerCase(), buffer }
  } catch {
    return null
  }
}

export function isWebpOnlyUrlOrData(value) {
  if (!value || typeof value !== 'string') return false
  if (value.startsWith('data:image/webp')) return !!parseWebpDataUrl(value)
  if (value.startsWith('data:')) return false
  if (/^https?:\/\//i.test(value)) return true
  if (value.startsWith('/')) return true
  return false
}

/**
 * Full pipeline: buffer → Sharp → storage (large + thumb)
 * @returns {Promise<{ url: string, thumbUrl: string, bytes: number }>}
 */
export async function processAndUploadProductImage(admin, buffer, meta = {}) {
  const { large, thumb } = await processProductImageBuffer(buffer)
  const baseMeta = { sellerId: meta.sellerId, productId: meta.productId, admin }

  // Same UUID base: build key once pattern via sequential puts with linked names
  const { randomUUID } = await import('crypto')
  const sid = String(meta.sellerId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'anon'
  const pid = String(meta.productId || 'new').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'new'
  const id = randomUUID()

  const { isR2Configured, r2PutObject } = await import('./storage/r2-adapter')
  const { supabasePutObject } = await import('./storage/supabase-adapter')
  const largeKey = `${sid}/${pid}/${id}.webp`
  const thumbKey = `${sid}/${pid}/${id}-thumb.webp`

  let url
  let thumbUrl
  if (isR2Configured()) {
    ;[url, thumbUrl] = await Promise.all([
      r2PutObject(large, largeKey, 'image/webp'),
      r2PutObject(thumb, thumbKey, 'image/webp'),
    ])
  } else {
    if (!admin) throw new Error('R2 تنظیم نشده؛ Supabase admin لازم است')
    ;[url, thumbUrl] = await Promise.all([
      supabasePutObject(admin, large, largeKey, 'image/webp'),
      supabasePutObject(admin, thumb, thumbKey, 'image/webp'),
    ])
  }

  return { url, thumbUrl, bytes: large.length }
}

/**
 * @deprecated prefer processAndUploadProductImage — kept for compatibility
 */
export async function uploadWebpToStorage(admin, buffer, meta = {}) {
  const result = await processAndUploadProductImage(admin, buffer, meta)
  return result.url
}

/**
 * Normalize images for DB: data URLs → storage URLs (max 8); keep existing https URLs
 * @returns {Promise<string[]>} large image URLs only
 */
export async function persistProductImages(admin, images, meta = {}) {
  const list = Array.isArray(images) ? images : []
  const out = []
  for (const item of list) {
    if (!item || typeof item !== 'string') continue
    if (out.length >= MAX_IMAGES_PER_PRODUCT) break
    if (item.startsWith('data:')) {
      const parsed = parseImageDataUrl(item)
      if (!parsed) continue
      try {
        const { url } = await processAndUploadProductImage(admin, parsed.buffer, meta)
        out.push(url)
      } catch (_) {
        /* skip failed */
      }
      continue
    }
    if (/^https?:\/\//i.test(item) || item.startsWith('/')) {
      out.push(item)
    }
  }
  return out.slice(0, MAX_IMAGES_PER_PRODUCT)
}
