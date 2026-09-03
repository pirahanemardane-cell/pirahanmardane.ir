/**
 * Cloudflare R2 adapter (S3-compatible)
 * Env:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET
 *   R2_PUBLIC_BASE_URL  (e.g. https://img.pirahanemardane.ir or pub-xxx.r2.dev)
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

let _client = null

export function isR2Configured() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET &&
    process.env.R2_PUBLIC_BASE_URL
  )
}

function getClient() {
  if (_client) return _client
  if (!isR2Configured()) throw new Error('R2 پیکربندی نشده است')
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
  return _client
}

/**
 * @param {Buffer} buffer
 * @param {string} key  e.g. sellerId/productId/uuid.webp
 * @param {string} contentType
 * @returns {Promise<string>} public URL
 */
export async function r2PutObject(buffer, key, contentType = 'image/webp') {
  const client = getClient()
  const bucket = process.env.R2_BUCKET
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  const base = String(process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  return `${base}/${key}`
}
