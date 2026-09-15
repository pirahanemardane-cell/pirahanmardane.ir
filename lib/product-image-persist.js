/**
 * Product images pipeline:
 * parse → Sharp (large+thumb × light/dark watermark) → R2/Supabase → public URLs
 */
import { processProductImageBuffer } from './image-process'
import { MAX_IMAGES_PER_PRODUCT, MAX_INPUT_BYTES } from './storage'

export { MAX_IMAGES_PER_PRODUCT, MAX_INPUT_BYTES }

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
 * @returns {Promise<{ url: string, urlDark: string, thumbUrl: string, thumbUrlDark: string, bytes: number }>}
 */
export async function processAndUploadProductImage(admin, buffer, meta = {}) {
  const { large, largeDark, thumb, thumbDark } = await processProductImageBuffer(buffer)

  const { randomUUID } = await import('crypto')
  const sid = String(meta.sellerId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'anon'
  const pid = String(meta.productId || 'new').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'new'
  const id = randomUUID()

  const { isR2Configured, r2PutObject } = await import('./storage/r2-adapter')
  const { supabasePutObject } = await import('./storage/supabase-adapter')

  const largeKey = `${sid}/${pid}/${id}.webp`
  const largeDarkKey = `${sid}/${pid}/${id}-dark.webp`
  const thumbKey = `${sid}/${pid}/${id}-thumb.webp`
  const thumbDarkKey = `${sid}/${pid}/${id}-thumb-dark.webp`

  const put = async (buf, key) => {
    if (isR2Configured()) return r2PutObject(buf, key, 'image/webp')
    if (!admin) throw new Error('R2 تنظیم نشده؛ Supabase admin لازم است')
    return supabasePutObject(admin, buf, key, 'image/webp')
  }

  const [url, urlDark, thumbUrl, thumbUrlDark] = await Promise.all([
    put(large, largeKey),
    put(largeDark, largeDarkKey),
    put(thumb, thumbKey),
    put(thumbDark, thumbDarkKey),
  ])

  return { url, urlDark, thumbUrl, thumbUrlDark, bytes: large.length }
}

export async function uploadWebpToStorage(admin, buffer, meta = {}) {
  const result = await processAndUploadProductImage(admin, buffer, meta)
  return result.url
}

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
      } catch (_) {}
      continue
    }
    if (/^https?:\/\//i.test(item) || item.startsWith('/')) {
      out.push(item)
    }
  }
  return out.slice(0, MAX_IMAGES_PER_PRODUCT)
}
