/**
 * GET/POST /api/cron/order-reminders
 *
 * یادآوری سفارش بدون اقدام + نزدیک شدن deadline
 *
 * امنیت: هدر Authorization: Bearer <CRON_SECRET>
 * یا ?secret=<CRON_SECRET>
 *
 * قوانین پیش‌فرض (env قابل تنظیم):
 *  - SMS_REMINDER_HOURS=24   → paid/processing بدون shipped بعد از N ساعت
 *  - SMS_DEADLINE_HOURS=48   → همان‌ها بعد از M ساعت → deadline near
 *
 * فقط وقتی SMS_SEND_RECOMMENDED=true پیامک recommended می‌رود
 * (helperها خودشان چک می‌کنند؛ این روت فقط صدا می‌زند)
 */
import { NextResponse } from 'next/server'
import { logCritical } from '../../../../lib/critical-log'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { smsOrderReminderSeller, smsOrderDeadlineNear } from '../../../../lib/sms/events'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(request) {
  const secret = process.env.CRON_SECRET || process.env.SMS_CRON_SECRET || ''
  if (!secret) {
    // در dev بدون secret اجازه بده؛ در prod حتماً بگذار
    return process.env.NODE_ENV !== 'production'
  }
  const auth = request.headers.get('authorization') || ''
  if (auth === `Bearer ${secret}`) return true
  const url = new URL(request.url)
  if (url.searchParams.get('secret') === secret) return true
  return false
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}

async function sellerContact(admin, sellerId) {
  const { data: sel } = await admin
    .from('sellers')
    .select('id, shop_name, phone, owner_id')
    .eq('id', sellerId)
    .maybeSingle()
  if (!sel) return null
  let phone = sel.phone
  let name = sel.shop_name || 'فروشنده'
  if (!phone && sel.owner_id) {
    const { data: prof } = await admin
      .from('profiles')
      .select('phone, full_name')
      .eq('id', sel.owner_id)
      .maybeSingle()
    phone = prof?.phone || phone
    if (!sel.shop_name && prof?.full_name) name = prof.full_name
  }
  if (!phone) return null
  return { phone, name, sellerId: sel.id }
}

async function handle(request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const reminderH = Math.max(6, Number(process.env.SMS_REMINDER_HOURS || 24) || 24)
  const deadlineH = Math.max(reminderH + 6, Number(process.env.SMS_DEADLINE_HOURS || 48) || 48)

  const admin = createAdminClient()
  const stats = { reminder: 0, deadline: 0, skipped: 0, errors: 0 }

  // سفارش‌های paid / processing / preparing که هنوز shipped نشده‌اند
  const { data: orders, error } = await admin
    .from('orders')
    .select('id, order_number, status, created_at, updated_at, paid_at')
    .in('status', ['paid', 'processing', 'preparing'])
    .lt('created_at', hoursAgo(reminderH))
    .order('created_at', { ascending: true })
    .limit(80)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  for (const order of orders || []) {
    try {
      const { data: items } = await admin
        .from('order_items')
        .select('seller_id')
        .eq('order_id', order.id)
      const sellerIds = [...new Set((items || []).map((x) => x.seller_id).filter(Boolean))]
      if (!sellerIds.length) {
        stats.skipped++
        continue
      }

      const anchor = new Date(order.paid_at || order.created_at).getTime()
      const ageH = (Date.now() - anchor) / (60 * 60 * 1000)
      const isDeadline = ageH >= deadlineH

      for (const sid of sellerIds) {
        const contact = await sellerContact(admin, sid)
        if (!contact) {
          stats.skipped++
          continue
        }
        if (isDeadline) {
          const remaining = `${Math.max(0, Math.round(deadlineH - ageH + deadlineH))}س` // نمایش تقریبی
          await smsOrderDeadlineNear({
            phone: contact.phone,
            sellerName: contact.name,
            orderNumber: order.order_number || order.id,
            remaining: ageH >= deadlineH ? 'گذشته از مهلت' : remaining,
          })
          stats.deadline++
        } else {
          await smsOrderReminderSeller({
            phone: contact.phone,
            sellerName: contact.name,
            orderNumber: order.order_number || order.id,
          })
          stats.reminder++
        }
      }
    } catch (e) {
      stats.errors++
      console.warn('[cron/order-reminders]', order?.id, e?.message || e)
    }
  }

  return NextResponse.json({
    ok: true,
    reminder_hours: reminderH,
    deadline_hours: deadlineH,
    orders_scanned: (orders || []).length,
    ...stats,
  })
}

export async function GET(request) {
  return handle(request)
}

export async function POST(request) {
  return handle(request)
}
