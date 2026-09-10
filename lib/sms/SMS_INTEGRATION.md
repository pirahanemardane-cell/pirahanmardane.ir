# راهنمای اتصال لایه SMS

## فایل‌های آماده (کپی مستقیم)

| مبدأ در artifacts | مقصد در ریپو |
|-------------------|--------------|
| `lib/sms/*` | `lib/sms/` |
| `payments-verify-route.FIXED.js` | `app/api/payments/verify/route.js` |
| `auth-otp-request-route.FIXED.js` / `otp-request-route.PRO.FIXED.js` | `app/api/auth/otp/request/route.js` |
| `orders-id-route.PRO.FIXED.js` | `app/api/orders/[id]/route.js` |
| `orders-return-route.PRO.FIXED.js` | `app/api/orders/[id]/return/route.js` (یا مسیر معادل) |
| `lib-otp.FIXED.js` | `lib/otp.js` |
| `lib/sms/*.SMS.snippet.js` | کپی قطعه داخل روت مربوطه |

تا وقتی `SMS_PATTERN_*` در env خالی باشد، `sendSms` **silent skip** می‌کند (سایت نمی‌شکند).

---

## ۱. env در Vercel

از `env.example.txt` کپی کن. حداقل این‌ها را اول ست کن:

```
MELIPAYAMAK_USERNAME=...
MELIPAYAMAK_PASSWORD=...
SMS_ENABLED=true
SMS_MOCK=true          # تا پترن‌ها ساخته نشده true بگذار
SMS_ADMIN_PHONES=0912...
```

بعد از ساخت هر پترن در ملی‌پیامک، bodyId را در همان `SMS_PATTERN_*` بگذار و `SMS_MOCK=false`.

---

## ۲. Helperهای آماده (`import { ... } from '@/lib/sms'`)

### 🔐 Auth (essential)
- `smsOtpRegister` / `smsOtpLogin` / `smsOtpRecovery`

### 🛡️ Security
- `smsPhoneChanged` / `smsPasswordChanged` (essential)
- `smsSuspiciousLogin` (recommended)

### 🛒 Order
- `smsOrderNewSeller` / `smsOrderConfirmed` / `smsOrderRejected` (essential)
- `smsOrderPlacedBuyer` / `smsOrderReminderSeller` / `smsOrderDeadlineNear` (recommended)

### 💳 Payment
- `smsPaymentSuccess` / `smsPaymentFailed` (essential)
- `smsPaymentRefundedGateway` (recommended)

### 🚚 Shipment
- `smsShipmentSent` / `smsShipmentTracking` (essential)
- `smsShipmentDelay` / `smsShipmentFailedDelivery` (recommended)

### 💰 Seller
- `smsSellerPayoutSuccess` / `smsSellerPayoutFailed` / `smsSellerBankChanged` (essential)
- `smsSellerPayoutProcessing` (recommended)

### ↩️ Return
- `smsReturnRequestedSeller` / `smsReturnDecisionBuyer` (essential)
- `smsReturnReceived` (recommended)

### 💸 Refund
- `smsRefundApproved` / `smsRefundDone` / `smsRefundFailed` (essential)
- `smsRefundRequested` (recommended)

### ⚖️ Dispute (essential)
- `smsDisputeOpened` / `smsDisputeActionNeeded` / `smsDisputeResolved`

### 🚨 Admin
- `smsAdminCritical` / `smsAdminPaymentOutage` (essential)
- `smsAdminFraud` / `smsAdminSmsOutage` (recommended)

---

## ۳. جای فراخوانی — روت‌های FIXED شده

| روت | SMS |
|-----|-----|
| `auth/otp/request` | OTP ثبت‌نام / ورود / بازیابی |
| `payments/verify` | پرداخت موفق + ناموفق + سفارش جدید فروشنده |
| `orders/[id]` (cancel) | لغو → order_rejected |
| `orders return` | مرجوعی → فروشنده |

---

## ۴. Snippetهای آماده (کپی داخل روت)

| فایل snippet | کاربرد |
|--------------|--------|
| `order-status.SMS.snippet.js` | تأیید / رد سفارش توسط فروشنده |
| `shipment.SMS.snippet.js` | ارسال + کد رهگیری |
| `seller-payout.SMS.snippet.js` | تسویه (processing / paid / failed) |
| `seller-bank.SMS.snippet.js` | تغییر حساب بانکی |
| `security-profile.SMS.snippet.js` | تغییر موبایل / رمز / ورود مشکوک |
| `dispute.SMS.snippet.js` | باز / اقدام / نتیجه اختلاف |
| `refund.SMS.snippet.js` | requested / approved / done / failed |
| `admin.SMS.snippet.js` | critical / fraud / payment outage / sms outage |
| `payments-verify.SMS.snippet.js` | (مرجع — نسخه FIXED کامل‌تر است) |

---

## ۵. ترتیب پیشنهادی کار

1. کپی `lib/sms/*` به ریپو
2. در Vercel: `MELIPAYAMAK_*` + `SMS_MOCK=true` + `SMS_ADMIN_PHONES`
3. روت‌های FIXED را جایگزین کن + snippetها را در روت‌های باقی‌مانده بچسبان
4. پترن‌های **essential** را در ملی‌پیامک بساز (متن‌ها در `patterns.js` → فیلد `sample`)
5. bodyId هر پترن را در env بگذار
6. `SMS_MOCK=false` و تست با شماره واقعی
7. بعداً recommendedها را با `SMS_SEND_RECOMMENDED=true` روشن کن

---

## ۶. نکات ملی‌پیامک

- متن پترن باید **دقیقاً** همان `sample` باشد (ترتیب `{0}` `{1}` ...).
- متغیرها با `;` جدا می‌شوند — لایه `send.js` خودش می‌سازد.
- تا تأیید ادمین ملی‌پیامک، bodyId کار نمی‌کند.
- پاسخ موفق معمولاً `recId` عددی بزرگ است؛ کدهای خطا اعداد کوچک‌اند.
- بدون bodyId → silent skip (سایت سالم می‌ماند).
