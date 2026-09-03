/**
 * Server-side final image standardization with Sharp
 * + site logo watermark (bottom-left) — same rules as client
 * Input: image buffer → Output: large + thumb WebP
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { IMAGE_VARIANTS, MAX_INPUT_BYTES } from './storage/constants'

/** Match client PRODUCT_IMG_DEFAULTS watermark */
export const SERVER_WATERMARK = {
  enabled: true,
  /** relative to process.cwd() */
  logoFiles: ['public/logo-white.webp', 'public/logo.webp'],
  widthRatio: 0.18,
  marginRatio: 0.035,
  opacity: 0.72,
  padOpacity: 0.28,
  minWidth: 48,
}

let _logoPngCache = null

async function loadLogoPng() {
  if (_logoPngCache) return _logoPngCache
  for (const rel of SERVER_WATERMARK.logoFiles) {
    const full = path.join(process.cwd(), rel)
    try {
      if (!fs.existsSync(full)) continue
      // Normalize to PNG with alpha for compositing
      _logoPngCache = await sharp(full).ensureAlpha().png().toBuffer()
      return _logoPngCache
    } catch (_) {
      /* try next */
    }
  }
  return null
}

/**
 * Apply bottom-left logo watermark (opacity + soft dark pad)
 * @param {Buffer} imageBuffer already resized WebP/PNG/JPEG buffer
 * @param {{ width: number, height: number }} dims
 */
async function applyWatermark(imageBuffer, dims) {
  if (!SERVER_WATERMARK.enabled) return imageBuffer
  const logoSrc = await loadLogoPng()
  if (!logoSrc) return imageBuffer

  const tw = dims.width
  const th = dims.height
  if (!tw || !th) return imageBuffer

  const margin = Math.max(8, Math.round(tw * SERVER_WATERMARK.marginRatio))
  const targetW = Math.max(SERVER_WATERMARK.minWidth, Math.round(tw * SERVER_WATERMARK.widthRatio))

  const logoResized = await sharp(logoSrc)
    .resize({ width: targetW, withoutEnlargement: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data, info } = logoResized
  const opacity = SERVER_WATERMARK.opacity
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = Math.round(data[i + 3] * opacity)
  }

  const logoTransparent = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()

  const targetH = info.height
  const pad = Math.max(4, Math.round(targetW * 0.08))
  const x = margin
  const y = Math.max(0, th - margin - targetH)

  // Soft dark pad behind logo (like client canvas)
  const padW = targetW + pad * 2
  const padH = targetH + pad * 2
  const padX = Math.max(0, x - pad)
  const padY = Math.max(0, y - pad)
  const padAlpha = Math.round(255 * SERVER_WATERMARK.padOpacity)
  const padSvg = Buffer.from(
    `<svg width="${padW}" height="${padH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${padW}" height="${padH}" rx="${Math.min(10, pad * 1.5)}" fill="rgba(0,0,0,${SERVER_WATERMARK.padOpacity})"/>
    </svg>`
  )

  return sharp(imageBuffer)
    .composite([
      { input: padSvg, top: padY, left: padX },
      { input: logoTransparent, top: y, left: x },
    ])
    .webp({ quality: 78, effort: 4 })
    .toBuffer()
}

/**
 * @param {Buffer} inputBuffer
 * @returns {Promise<{ large: Buffer, thumb: Buffer, meta: { width: number, height: number } }>}
 */
export async function processProductImageBuffer(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) {
    throw new Error('بافر تصویر خالی است')
  }
  if (inputBuffer.length > MAX_INPUT_BYTES) {
    throw new Error(`حجم تصویر بیش از ${Math.round(MAX_INPUT_BYTES / 1024)}KB مجاز نیست`)
  }

  const meta = await sharp(inputBuffer, { failOn: 'none' }).metadata()
  if (!meta.width || !meta.height) {
    throw new Error('فایل تصویر نامعتبر است')
  }

  const largeCfg = IMAGE_VARIANTS.large
  const thumbCfg = IMAGE_VARIANTS.thumb

  // Base resize (before watermark)
  const largeBase = await sharp(inputBuffer, { failOn: 'none' })
    .rotate()
    .resize(largeCfg.width, largeCfg.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer({ resolveWithObject: true })

  const thumbBase = await sharp(inputBuffer, { failOn: 'none' })
    .rotate()
    .resize(thumbCfg.width, thumbCfg.height, {
      fit: 'cover',
      position: 'centre',
    })
    .png()
    .toBuffer({ resolveWithObject: true })

  const [large, thumb] = await Promise.all([
    applyWatermark(largeBase.data, {
      width: largeBase.info.width,
      height: largeBase.info.height,
    }).then((buf) =>
      // ensure webp quality from variant if applyWatermark already webp
      sharp(buf).webp({ quality: largeCfg.quality, effort: 4 }).toBuffer()
    ),
    applyWatermark(thumbBase.data, {
      width: thumbBase.info.width,
      height: thumbBase.info.height,
    }).then((buf) =>
      sharp(buf).webp({ quality: thumbCfg.quality, effort: 4 }).toBuffer()
    ),
  ])

  return {
    large,
    thumb,
    meta: { width: meta.width, height: meta.height },
  }
}
