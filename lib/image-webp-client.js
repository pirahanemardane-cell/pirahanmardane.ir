/**
 * Client-side product image → WebP only + site logo watermark (bottom-left).
 * Max compression while keeping visual quality.
 */

export const PRODUCT_IMG_DEFAULTS = {
  w: 800,
  h: 1000,
  maxBytes: 65000,
  quality: 0.82,
  minQuality: 0.50,
  maxPerProduct: 8,
  maxUploadBytes: 8 * 1024 * 1024,
  sizeSteps: [
    [800, 1000],
    [720, 900],
    [640, 800],
    [560, 700],
  ],
  /** Watermark (پیراهن مردانه) */
  watermark: true,
  watermarkSrc: '/logo-white.webp',
  watermarkFallback: '/logo.webp',
  /** Width of logo relative to canvas width */
  watermarkWidthRatio: 0.18,
  watermarkMarginRatio: 0.035,
  watermarkOpacity: 0.72,
};

function approxBytesFromDataUrl(dataUrl) {
  const i = dataUrl.indexOf(',');
  const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
  return Math.round((b64.length * 3) / 4);
}

export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e || new Error('خواندن تصویر ناموفق'));
    };
    img.src = url;
  });
}

export function loadImage(source) {
  if (typeof source !== 'string') return fileToImage(source);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('بارگذاری تصویر ناموفق'));
    img.src = source;
  });
}

let _wmPromise = null;
async function loadWatermarkLogo(cfg) {
  if (cfg.watermark === false) return null;
  if (_wmPromise) return _wmPromise;
  _wmPromise = (async () => {
    try {
      return await loadImage(cfg.watermarkSrc || '/logo-white.webp');
    } catch (_) {
      try {
        return await loadImage(cfg.watermarkFallback || '/logo.webp');
      } catch (__) {
        return null;
      }
    }
  })();
  return _wmPromise;
}

/** Draw small site logo bottom-left (واترمارک) */
function drawWatermark(ctx, logo, tw, th, cfg) {
  if (!logo || !logo.width) return;
  const margin = Math.max(8, Math.round(tw * (cfg.watermarkMarginRatio ?? 0.035)));
  const targetW = Math.max(48, Math.round(tw * (cfg.watermarkWidthRatio ?? 0.18)));
  const targetH = Math.round((logo.height / logo.width) * targetW);
  const x = margin; // چپ
  const y = th - margin - targetH; // پایین

  ctx.save();
  // soft dark pad so white logo stays readable on light shirts
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#000000';
  const pad = Math.max(4, Math.round(targetW * 0.08));
  const rw = targetW + pad * 2;
  const rh = targetH + pad * 2;
  const rx = x - pad;
  const ry = y - pad;
  const r = Math.min(10, pad * 1.5);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rx, ry, rw, rh, r);
  } else {
    ctx.rect(rx, ry, rw, rh);
  }
  ctx.fill();

  ctx.globalAlpha = cfg.watermarkOpacity ?? 0.72;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(logo, x, y, targetW, targetH);
  ctx.restore();
}

/**
 * Cover-fit + watermark + WebP only.
 * Returns { dataUrl, width, height, bytes, quality }.
 */
export async function encodeProductWebP(source, opts = {}) {
  const cfg = { ...PRODUCT_IMG_DEFAULTS, ...opts };
  const img = await loadImage(source);
  const logo = await loadWatermarkLogo(cfg);

  const tryEncode = (tw, th, q) => {
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tw, th);

    const scale =
      opts.scale != null
        ? opts.scale
        : Math.max(tw / img.width, th / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const ox = opts.offsetX != null ? opts.offsetX : (tw - dw) / 2;
    const oy = opts.offsetY != null ? opts.offsetY : (th - dh) / 2;
    ctx.drawImage(img, ox, oy, dw, dh);

    // واترمارک لوگوی «پیراهن مردانه» — گوشه پایین چپ
    if (cfg.watermark !== false) {
      drawWatermark(ctx, logo, tw, th, cfg);
    }

    // فقط WebP
    const dataUrl = canvas.toDataURL('image/webp', q);
    if (!dataUrl.startsWith('data:image/webp')) {
      throw new Error('مرورگر خروجی WebP پشتیبانی نمی‌کند');
    }
    const bytes = approxBytesFromDataUrl(dataUrl);
    return { dataUrl, bytes, width: tw, height: th, quality: q };
  };

  let best = null;

  for (const [tw, th] of cfg.sizeSteps) {
    let lo = cfg.minQuality;
    let hi = cfg.quality;
    let localBest = null;
    for (let i = 0; i < 10; i++) {
      const mid = Math.round(((lo + hi) / 2) * 100) / 100;
      const r = tryEncode(tw, th, mid);
      if (r.bytes <= cfg.maxBytes) {
        localBest = r;
        lo = mid + 0.01;
      } else {
        hi = mid - 0.01;
      }
      if (hi < lo) break;
    }
    const atHi = tryEncode(tw, th, cfg.quality);
    if (atHi.bytes <= cfg.maxBytes) localBest = atHi;

    if (localBest) {
      best = localBest;
      break;
    }
    best = tryEncode(tw, th, cfg.minQuality);
  }

  if (!best || best.bytes > cfg.maxBytes) {
    const [tw, th] = cfg.sizeSteps[cfg.sizeSteps.length - 1];
    best = tryEncode(tw, th, Math.max(0.4, cfg.minQuality - 0.05));
  }

  if (!best || best.bytes > cfg.maxBytes * 1.15) {
    throw new Error(
      `حجم خروجی WebP بیش از حد مجاز شد (${Math.round((best?.bytes || 0) / 1024)}KB). تصویر ساده‌تر یا برش دقیق‌تر امتحان کنید.`
    );
  }

  return best;
}

/** File → dataURL WebP + watermark (seller/admin product images) */
export async function processProductImageFile(file, opts = {}) {
  const cfg = { ...PRODUCT_IMG_DEFAULTS, ...opts };
  if (!file) throw new Error('فایلی انتخاب نشده');
  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('فقط فایل تصویری مجاز است');
  }
  if (file.size > cfg.maxUploadBytes) {
    throw new Error(
      `حجم فایل خام بیش از ${Math.round(cfg.maxUploadBytes / (1024 * 1024))} مگابایت است`
    );
  }
  const result = await encodeProductWebP(file, { ...cfg, watermark: true });
  return result.dataUrl;
}
