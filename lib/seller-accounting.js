/**
 * محاسبه سهم فروشنده / کمیسیون پلتفرم برای خروجی حسابداری
 *
 * env:
 *   SELLER_COMMISSION_RATE  — درصد کمیسیون پلتفرم (پیش‌فرض 10)
 *   اگر روی sellers.commission_rate باشد، همان اولویت دارد
 */

export function getDefaultCommissionRate() {
  const n = Number(process.env.SELLER_COMMISSION_RATE)
  if (Number.isFinite(n) && n >= 0 && n <= 100) return n
  return 10
}

/**
 * @param {number} gross — مبلغ ناخالص سهم فروشنده (تومان)
 * @param {number} ratePercent — درصد کمیسیون پلتفرم
 */
export function splitCommission(gross, ratePercent) {
  const g = Math.max(0, Math.round(Number(gross) || 0))
  const rate = Number.isFinite(Number(ratePercent)) ? Number(ratePercent) : getDefaultCommissionRate()
  const commission = Math.round((g * rate) / 100)
  const net = Math.max(0, g - commission)
  return {
    gross: g,
    commission_rate: rate,
    commission,
    net,
  }
}

/** وضعیت حسابداری بر اساس status سفارش */
export function accountingStatus(orderStatus) {
  const s = String(orderStatus || '').toLowerCase()
  if (['cancelled', 'canceled', 'rejected'].includes(s)) return 'cancelled'
  if (['refunded'].includes(s)) return 'refunded'
  if (['delivered'].includes(s)) return 'ready_to_settle'
  if (['shipped'].includes(s)) return 'shipped'
  if (['paid', 'processing', 'preparing', 'confirmed'].includes(s)) return 'awaiting_fulfillment'
  if (['pending', 'pending_payment'].includes(s)) return 'pending_payment'
  return s || 'unknown'
}

export const ACCOUNTING_STATUS_FA = {
  pending_payment: 'در انتظار پرداخت',
  awaiting_fulfillment: 'در انتظار پردازش/آماده‌سازی',
  shipped: 'ارسال‌شده',
  ready_to_settle: 'آماده تسویه',
  refunded: 'برگشت‌خورده',
  cancelled: 'لغو/رد',
  unknown: 'نامشخص',
}

/** CSV با BOM برای Excel فارسی */
export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const header = columns.map((c) => esc(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => esc(row[c.key])).join(','))
  // UTF-8 BOM
  return '\uFEFF' + [header, ...lines].join('\r\n')
}

export const SELLER_ORDER_CSV_COLUMNS = [
  { key: 'order_number', label: 'شماره سفارش' },
  { key: 'order_id', label: 'شناسه سفارش' },
  { key: 'created_at', label: 'تاریخ ثبت' },
  { key: 'paid_at', label: 'تاریخ پرداخت' },
  { key: 'status', label: 'وضعیت سفارش' },
  { key: 'accounting_status', label: 'وضعیت حسابداری' },
  { key: 'items_count', label: 'تعداد اقلام' },
  { key: 'qty_total', label: 'جمع تعداد' },
  { key: 'gross', label: 'مبلغ ناخالص (تومان)' },
  { key: 'commission_rate', label: 'درصد کمیسیون' },
  { key: 'commission', label: 'کمیسیون پلتفرم (تومان)' },
  { key: 'net', label: 'مبلغ خالص فروشنده (تومان)' },
  { key: 'item_titles', label: 'اقلام' },
]
