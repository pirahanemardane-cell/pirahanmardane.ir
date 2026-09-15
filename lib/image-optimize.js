/**
 * بهینه‌سازی تصویر آپلود — resize + webp (با sharp اگر موجود باشد)
 *
 * env:
 *   IMAGE_MAX_WIDTH=1600
 *   IMAGE_QUALITY=80
 */

export async function optimizeImageBuffer(inputBuffer, opts = {}) {
  const maxWidth = Number(opts.maxWidth || process.env.IMAGE_MAX_WIDTH) || 1600
  const quality = Number(opts.quality || process.env.IMAGE_QUALITY) || 80
  const buf = Buffer.isBuffer(inputBuffer) ? inputBuffer : Buffer.from(inputBuffer)

  try {
    const sharp = (await import('sharp')).default
    const img = sharp(buf, { failOn: 'none' }).rotate()
    const meta = await img.metadata()
    let pipeline = img
    if (meta.width && meta.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
    }
    const out = await pipeline.webp({ quality }).toBuffer()
    return {
      buffer: out,
      contentType: 'image/webp',
      ext: 'webp',
      width: meta.width || null,
      optimized: true,
    }
  } catch (e) {
    // sharp نیست یا خطا — همان فایل اصلی
    return {
      buffer: buf,
      contentType: opts.contentType || 'application/octet-stream',
      ext: opts.ext || 'bin',
      width: null,
      optimized: false,
      error: String(e?.message || e),
    }
  }
}
