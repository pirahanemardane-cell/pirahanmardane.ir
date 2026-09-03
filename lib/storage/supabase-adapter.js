/**
 * Fallback: Supabase Storage when R2 is not configured
 */
import { STORAGE_BUCKET_FALLBACK } from './constants'

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {Buffer} buffer
 * @param {string} key
 * @param {string} contentType
 */
export async function supabasePutObject(admin, buffer, key, contentType = 'image/webp') {
  if (!admin?.storage) throw new Error('Supabase admin client لازم است')
  const { error } = await admin.storage.from(STORAGE_BUCKET_FALLBACK).upload(key, buffer, {
    contentType,
    upsert: false,
    cacheControl: '31536000',
  })
  if (error) throw new Error(error.message || 'آپلود Storage ناموفق')
  const { data } = admin.storage.from(STORAGE_BUCKET_FALLBACK).getPublicUrl(key)
  if (!data?.publicUrl) throw new Error('URL عمومی ساخته نشد')
  return data.publicUrl
}
