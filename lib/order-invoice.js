/** ساخت HTML فاکتور سفارش برای چاپ */

export function buildOrderInvoiceHtml(o) {
  if (!o) return "";
  const itemsHtml = (o.items || [])
    .map(
      (it) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${it.name || ""}${it.color ? " · " + it.color : ""}${it.size ? " · سایز " + it.size : ""}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${it.qty || 1}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;direction:ltr">${Number(it.price || 0).toLocaleString("fa-IR")}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;direction:ltr">${Number((it.price || 0) * (it.qty || 1)).toLocaleString("fa-IR")}</td>
          </tr>`
    )
    .join("");
  const shipCost = o.shipping?.cost ?? 0;
  const discount = o.payment?.discount ?? 0;
  const total = o.total ?? o.totals?.payable ?? 0;
  const goods = total - shipCost + discount;
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/><title>فاکتور ${o.id}</title>
          <style>
            body{font-family:Tahoma,Arial,sans-serif;padding:24px;color:#111;max-width:720px;margin:0 auto}
            h1{font-size:18px;margin:0 0 4px} .muted{color:#6b7280;font-size:12px}
            table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
            th{background:#f3f4f6;padding:8px;text-align:right;border-bottom:2px solid #e5e7eb}
            .totals{margin-top:16px;font-size:13px;line-height:1.9}
            .totals .row{display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:4px 0}
            .totals .final{font-weight:bold;font-size:15px;border-top:2px solid #111;margin-top:8px;padding-top:8px}
            @media print{body{padding:0} .no-print{display:none}}
          </style></head><body>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
            <div><h1>فاکتور / رسید سفارش</h1><p class="muted">پیراهن مردانه — بازارگاه تخصصی</p></div>
            <div style="text-align:left"><p style="margin:0;font-weight:bold;direction:ltr">${o.id}</p><p class="muted">${o.date || ""}</p></div>
          </div>
          <p class="muted" style="margin-top:12px">وضعیت: ${o.statusLabel || o.status || "—"} · پرداخت: ${o.payment?.method || "درگاه بانکی"}</p>
          <table><thead><tr><th>کالا</th><th style="text-align:center">تعداد</th><th style="text-align:left">قیمت واحد</th><th style="text-align:left">جمع</th></tr></thead>
          <tbody>${itemsHtml || '<tr><td colspan="4" style="padding:12px;text-align:center">بدون آیتم</td></tr>'}</tbody></table>
          <div class="totals">
            <div class="row"><span>مبلغ کالا</span><span>${Number(goods).toLocaleString("fa-IR")} تومان</span></div>
            ${discount > 0 ? `<div class="row"><span>تخفیف</span><span>−${Number(discount).toLocaleString("fa-IR")} تومان</span></div>` : ""}
            <div class="row"><span>ارسال</span><span>${Number(shipCost).toLocaleString("fa-IR")} تومان</span></div>
            <div class="row final"><span>مبلغ قابل پرداخت</span><span>${Number(total).toLocaleString("fa-IR")} تومان</span></div>
          </div>
          <p class="muted" style="margin-top:24px">این فاکتور از پنل خریدار قابل چاپ است. برای پشتیبانی شماره سفارش را ذکر کنید.</p>
          <p class="no-print" style="margin-top:16px"><button onclick="window.print()" style="padding:10px 20px;border-radius:999px;background:#2563eb;color:#fff;border:0;cursor:pointer;font-family:inherit">چاپ فاکتور</button></p>
          <script>setTimeout(function(){try{window.print()}catch(e){}},400)</script>
          </body></html>`;
}
