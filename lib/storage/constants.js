/** Product image limits (server is source of truth) */
export const MAX_IMAGES_PER_PRODUCT = 8
export const MAX_INPUT_BYTES = 2 * 1024 * 1024 // after client WebP; hard cap on server
export const MAX_RAW_UPLOAD_BYTES = 8 * 1024 * 1024

/** Sharp output variants */
export const IMAGE_VARIANTS = {
  large: { width: 1200, height: 1500, quality: 78, suffix: '' },
  thumb: { width: 400, height: 500, quality: 70, suffix: '-thumb' },
}

export const STORAGE_BUCKET_FALLBACK = 'product-images'
