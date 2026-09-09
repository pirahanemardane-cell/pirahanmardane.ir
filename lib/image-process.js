/**
 * Server-side Sharp: resize + theme watermarks
 * light → red_w_bg.webp | dark → blue_w_bg.webp
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { IMAGE_VARIANTS, MAX_INPUT_BYTES } from './storage/constants'

export const SERVER_WATERMARK = {
  enabled: true,
  logos: {
    light: ['public/red_w_bg.webp'],
    dark: ['public/blue_w_bg.webp'],
  },
  widthRatio: 0.18,
  marginRatio: 0.035,
  opacity: 0.72,
  padOpacity: 0.28,
  minWidth: 48,
}

const _logoCache = { light: null, dark: null }

async function loadLogoPng(theme = 'light') {
  const key = theme === 'dark' ? 'dark' : 'light'
  if (_logoCache[key]) return _logoCache[key]
  const files = SERVER_WATERMARK.logos[key] || SERVER_WATERMARK.logos.light
  for (const rel of files) {
    const full = path.join(process.cwd(), rel)
    try {
      if (!fs.existsSync(full)) continue
      _logoCache[key] = await sharp(full).ensureAlpha().png().toBuffer()
      return _logoCache[key]
    } catch (_) {}
  }
  return null
}

async function applyWatermark(imageBuffer, dims, theme = 'light') {
  if (!SERVER_WATERMARK.enabled) return imageBuffer
  const logoSrc = await loadLogoPng(theme)
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
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = Math.round(data[i + 3] * SERVER_WATERMARK.opacity)
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
  const padW = targetW + pad * 2
  const padH = targetH + pad * 2
  const padX = Math.max(0, x - pad)
  const padY = Math.max(0, y - pad)
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
 * @returns {Promise<{ large: Buffer, largeDark: Buffer, thumb: Buffer, thumbDark: Buffer, meta: object }>}
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

  const largeBase = await sharp(inputBuffer, { failOn: 'none' })
    .rotate()
    .resize(largeCfg.width, largeCfg.height, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true })

  const thumbBase = await sharp(inputBuffer, { failOn: 'none' })
    .rotate()
    .resize(thumbCfg.width, thumbCfg.height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer({ resolveWithObject: true })

  const L = { width: largeBase.info.width, height: largeBase.info.height }
  const T = { width: thumbBase.info.width, height: thumbBase.info.height }

  const [large, largeDark, thumb, thumbDark] = await Promise.all([
    applyWatermark(largeBase.data, L, 'light').then((b) =>
      sharp(b).webp({ quality: largeCfg.quality, effort: 4 }).toBuffer()
    ),
    applyWatermark(largeBase.data, L, 'dark').then((b) =>
      sharp(b).webp({ quality: largeCfg.quality, effort: 4 }).toBuffer()
    ),
    applyWatermark(thumbBase.data, T, 'light').then((b) =>
      sharp(b).webp({ quality: thumbCfg.quality, effort: 4 }).toBuffer()
    ),
    applyWatermark(thumbBase.data, T, 'dark').then((b) =>
      sharp(b).webp({ quality: thumbCfg.quality, effort: 4 }).toBuffer()
    ),
  ])

  return {
    large,
    largeDark,
    thumb,
    thumbDark,
    meta: { width: meta.width, height: meta.height },
  }
}
