'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

const SimpleEditor = dynamic(() => import('../SimpleEditor'), { ssr: false })

export default function AdminReviewsTab({ showToast }) {
  const toast = (message, variant = 'default') => {
    try {
      if (typeof showToast === 'function') showToast({ message, variant, duration: 4000, position: 'top-center' })
    } catch (_) {}
  }

  const [filter, setFilter] = useState('pending')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    rating: 5, title: '', body: '', display_name: '', display_avatar_url: '',
    seller_id: '', seller_name: '', is_featured: true, publish: true,
  })
  const emptyForm = () => ({
    rating: 5, title: '', body: '', display_name: '', display_avatar_url: '',
    seller_id: '', seller_name: '', is_featured: true, publish: true,
  })
  const [avatars, setAvatars] = useState([])
  const [avatarsLoading, setAvatarsLoading] = useState(false)

  const loadReviews = useCallback(async (status = filter) => {
    setLoading(true)
    try {
      let q = ''
      if (status === 'featured') q = '?featured=true'
      else if (status && status !== 'all') q = `?status=${status}`
      const res = await fetch(`/api/admin/reviews${q}`, { credentials: 'include', cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (data?.ok) setList(data.reviews || [])
      else toast(data?.error || 'خطا در بارگذاری نظرات', 'error')
    } catch (e) {
      toast(String(e?.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  const loadAvatars = useCallback(async () => {
    setAvatarsLoading(true)
    try {
      const res = await fetch('/api/admin/avatars?status=pending', { credentials: 'include', cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (data?.ok) setAvatars(data.profiles || [])
    } catch (_) {
    } finally {
      setAvatarsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReviews(filter)
    loadAvatars()
  }, [filter, loadReviews, loadAvatars])

  // Realtime: هر تغییر روی جدول reviews لیست را تازه می‌کند
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    const channel = supabase
      .channel('admin-reviews-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => { loadReviews(filter) },
      )
      .subscribe()
    return () => {
      try { supabase.removeChannel(channel) } catch (_) {}
    }
  }, [filter, loadReviews])

  const patchReview = async (id, patch) => {
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.ok) { toast('ذخیره شد', 'success'); loadReviews(filter) }
      else toast(data?.error || 'خطا', 'error')
    } catch (e) { toast(String(e?.message || e), 'error') }
    finally { setBusyId(null) }
  }

  const deleteReview = async (id) => {
    if (!window.confirm('حذف این نظر؟')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (data?.ok) { toast('حذف شد', 'success'); loadReviews(filter) }
      else toast(data?.error || 'خطا', 'error')
    } catch (e) { toast(String(e?.message || e), 'error') }
    finally { setBusyId(null) }
  }

  const openEdit = (r) => {
    setEditingId(r.id)
    setForm({
      rating: r.rating || 5,
      title: r.title || '',
      body: r.body || '',
      display_name: r.display_name || r.profiles?.full_name || '',
      display_avatar_url: r.display_avatar_url || '',
      seller_id: r.seller_id || '',
      seller_name: r.sellers?.shop_name || '',
      is_featured: !!r.is_featured,
      publish: r.status === 'approved',
    })
    setFormOpen(true)
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch (_) {}
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  const saveManual = async () => {
    if (!form.display_name.trim()) { toast('نام نمایشی الزامی است', 'error'); return }
    if (!form.body.trim()) { toast('متن نظر الزامی است', 'error'); return }
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch('/api/admin/reviews', {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            rating: form.rating,
            title: form.title,
            body: form.body,
            display_name: form.display_name,
            display_avatar_url: form.display_avatar_url || null,
            is_featured: form.is_featured,
            status: form.publish ? 'approved' : 'pending',
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (data?.ok) {
          toast('نظر ویرایش شد', 'success')
          closeForm()
          loadReviews(filter)
        } else toast(data?.error || 'خطا', 'error')
      } else {
        const res = await fetch('/api/admin/reviews', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json().catch(() => ({}))
        if (data?.ok) {
          toast('نظر ذخیره شد', 'success')
          closeForm()
          setFilter('approved')
          loadReviews('approved')
        } else toast(data?.error || 'خطا', 'error')
      }
    } catch (e) { toast(String(e?.message || e), 'error') }
    finally { setSaving(false) }
  }

  const handleAvatarAction = async (userId, action) => {
    setBusyId(userId)
    try {
      const res = await fetch('/api/admin/avatars', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.ok) { toast(action === 'approve' ? 'آواتار تأیید شد' : 'آواتار رد شد', 'success'); loadAvatars() }
      else toast(data?.error || 'خطا', 'error')
    } catch (e) { toast(String(e?.message || e), 'error') }
    finally { setBusyId(null) }
  }

  const uploadAvatarForForm = async (file) => {
    if (!file) return
    try {
      const reader = new FileReader()
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/media/upload-image', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, folder: 'users' }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.ok && data.url) {
        setForm((f) => ({ ...f, display_avatar_url: data.url }))
        toast('تصویر آپلود شد', 'success')
      } else toast(data?.error || 'آپلود ناموفق', 'error')
    } catch (e) { toast(String(e?.message || e), 'error') }
  }

  const statusBadge = (st) => {
    const map = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-emerald-100 text-emerald-800', rejected: 'bg-red-100 text-red-800' }
    const labels = { pending: 'در انتظار', approved: 'تأییدشده', rejected: 'ردشده' }
    return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${map[st] || 'bg-gray-100'}`}>{labels[st] || st}</span>
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-primary-900 dark:text-white">آواتارهای در انتظار تأیید</h3>
          <button type="button" onClick={loadAvatars} className="text-xs text-apple-blue">تازه‌سازی</button>
        </div>
        {avatarsLoading ? (
          <p className="text-xs text-primary-500">در حال بارگذاری...</p>
        ) : avatars.length === 0 ? (
          <p className="text-xs text-primary-500">موردی در انتظار نیست.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {avatars.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl border border-primary-100 dark:border-white/10">
                <img src={p.avatar_pending_url || '/logo.webp'} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{p.full_name || p.phone || p.id.slice(0, 8)}</p>
                  <div className="flex gap-1 mt-1">
                    <button type="button" disabled={busyId === p.id} onClick={() => handleAvatarAction(p.id, 'approve')} className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-600 text-white">تأیید</button>
                    <button type="button" disabled={busyId === p.id} onClick={() => handleAvatarAction(p.id, 'reject')} className="text-[11px] px-2 py-0.5 rounded-full bg-red-500 text-white">رد</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'pending', label: 'در انتظار' },
            { id: 'approved', label: 'تأییدشده' },
            { id: 'rejected', label: 'ردشده' },
            { id: 'featured', label: 'ویژه (صفحه اصلی)' },
            { id: 'all', label: 'همه' },
          ].map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition ${filter === f.id ? 'bg-apple-blue text-white' : 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (formOpen) closeForm()
            else { setEditingId(null); setForm(emptyForm()); setFormOpen(true) }
          }}
          className="text-sm px-4 py-2 rounded-full bg-apple-blue text-white font-bold"
        >
          {formOpen ? 'بستن فرم' : '+ افزودن نظر دستی'}
        </button>
      </div>

      {formOpen && (
        <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 p-4 space-y-3">
          <h3 className="text-sm font-bold">{editingId ? 'ویرایش نظر' : 'نظر دستی (برای نمایش در صفحه اصلی)'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="نام نمایشی خریدار *" value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
            <div className="flex items-center gap-2">
              <input type="text" placeholder="آدرس تصویر آواتار (اختیاری)" value={form.display_avatar_url}
                onChange={(e) => setForm((f) => ({ ...f, display_avatar_url: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
              <label className="text-xs px-3 py-2 rounded-full border cursor-pointer whitespace-nowrap">
                آپلود
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadAvatarForForm(e.target.files?.[0])} />
              </label>
            </div>
            <input type="text" placeholder="عنوان (اختیاری)" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm" />
            <div className="flex items-center gap-3">
              <label className="text-xs">امتیاز:</label>
              <select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="px-3 py-2 rounded-xl border text-sm">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ستاره</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block">متن نظر *</label>
            <SimpleEditor value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} placeholder="متن نظر مشتری..." />
          </div>
          <div>
            <label className="text-xs mb-1 block">نام فروشنده</label>
            <input
              type="text"
              placeholder="مثال: فروشگاه پیراهن مردانه"
              value={form.seller_name || ''}
              onChange={(e) => setForm((f) => ({ ...f, seller_name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
              نمایش در carousel صفحه اصلی
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.publish} onChange={(e) => setForm((f) => ({ ...f, publish: e.target.checked }))} />
              فوراً منتشر شود (تأییدشده)
            </label>
          </div>
          <button type="button" disabled={saving} onClick={saveManual}
            className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold disabled:opacity-60">
            {saving ? 'در حال ذخیره...' : (editingId ? 'ذخیره تغییرات' : 'ذخیره نظر')}
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-primary-500">در حال بارگذاری...</p>
        ) : list.length === 0 ? (
          <p className="p-6 text-sm text-primary-500">نظری یافت نشد.</p>
        ) : (
          <div className="divide-y divide-primary-100 dark:divide-white/10">
            {list.map((r) => (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row gap-3">
                <img
                  src={r.display_avatar_url || (r.profiles?.avatar_status === 'approved' ? r.profiles?.avatar_url : null) || '/logo.webp'}
                  alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">{r.display_name || r.profiles?.full_name || 'خریدار'}</span>
                    {statusBadge(r.status)}
                    {r.is_featured && <span className="text-[11px] px-2 py-0.5 rounded-full bg-apple-blue/15 text-apple-blue">ویژه</span>}
                    {r.is_admin_created && <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">دستی</span>}
                    <span className="text-xs text-primary-400">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
                  </div>
                                    {r.products?.name && <p className="text-xs text-primary-500">محصول: {r.products.name || r.products.title}</p>}
                  <div className="text-sm text-primary-800 dark:text-white/90 line-clamp-3" dangerouslySetInnerHTML={{ __html: r.body || r.title || '' }} />
                  <p className="text-[11px] text-primary-400">{r.created_at ? new Date(r.created_at).toLocaleString('fa-IR') : ''}</p>
                </div>
                <div className="flex flex-wrap sm:flex-col gap-1.5 flex-shrink-0">
                  {r.status !== 'approved' && (
                    <button type="button" disabled={busyId === r.id} onClick={() => patchReview(r.id, { status: 'approved', is_featured: true })}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-600 text-white">تأیید + ویژه</button>
                  )}
                  {r.status !== 'approved' && (
                    <button type="button" disabled={busyId === r.id} onClick={() => patchReview(r.id, { status: 'approved' })}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/80 text-white">فقط تأیید</button>
                  )}
                  {r.status !== 'rejected' && (
                    <button type="button" disabled={busyId === r.id} onClick={() => patchReview(r.id, { status: 'rejected', is_featured: false })}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500 text-white">رد</button>
                  )}
                  <button type="button" disabled={busyId === r.id} onClick={() => patchReview(r.id, { is_featured: !r.is_featured })}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-primary-300 text-primary-700">
                    {r.is_featured ? 'حذف از ویژه' : 'ویژه کردن'}
                  </button>
                  <button type="button" disabled={busyId === r.id} onClick={() => openEdit(r)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-apple-blue text-apple-blue">ویرایش</button>
                  <button type="button" disabled={busyId === r.id} onClick={() => deleteReview(r.id)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-red-300 text-red-600">حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
