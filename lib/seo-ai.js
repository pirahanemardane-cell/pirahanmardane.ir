/** پیشنهادهای سئوی محلی (بدون API خارجی) */

import { seoPixelReport } from "@/lib/seo-pixel";

export function suggestInternalLinksFromPool(pool, { focusKeywords = "", bodyText = "", pathForProduct } = {}) {
  const kws = String(focusKeywords || "")
    .split(/[,،]/)
    .map((x) => x.trim())
    .filter(Boolean);
  const bodyL = String(bodyText || "").toLowerCase();
  const scored = (pool || [])
    .map((p) => {
      const name = String(p.name || "").toLowerCase();
      let sc = 0;
      kws.forEach((k) => {
        if (name.includes(k.toLowerCase()) || bodyL.includes(String(p.name || "").toLowerCase())) sc += 2;
      });
      if (p.discount) sc += 0.5;
      return { p, sc };
    })
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 5);
  return scored.map(({ p }) => ({
    id: p.id,
    name: p.name,
    path:
      typeof pathForProduct === "function"
        ? pathForProduct(p.name || p.title, p.shopName || p.sellerName || p.brand || "")
        : "",
    label: p.name,
  }));
}

export function getSeoAiQuotaState(seoAiDaily, role = "admin") {
  const day = new Date().toISOString().slice(0, 10);
  const key = role + ":" + day;
  const used = Number((seoAiDaily || {})[key] || 0);
  const limit = role === "seller" ? 15 : 200;
  return { day, key, used, limit, left: Math.max(0, limit - used) };
}

export function aiGenerateSeoMeta({ name = "", desc = "", focusKeywords = "", mode = "product" } = {}) {
  const kw = String(focusKeywords || "")
    .split(/[,،]/)
    .map((x) => x.trim())
    .filter(Boolean)[0] || name;
  const cleanDesc = String(desc || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const title = (kw || name || "محصول").slice(0, 55);
  let description = cleanDesc.slice(0, 150);
  if (description.length < 70) {
    description = `${name || kw} — خرید آنلاین از فروشگاه پیراهن مردانه با ارسال سریع و ضمانت اصالت.`.slice(0, 155);
  }
  if (mode === "article") {
    return {
      title: (name || kw).slice(0, 58),
      description: (cleanDesc || `مطلب ${name} در بلاگ پیراهن مردانه`).slice(0, 155),
      summary: (cleanDesc || name).slice(0, 220),
    };
  }
  return { title, description, summary: description };
}

export function aiSuggestFaq({ name = "", desc = "", focusKeywords = "" } = {}) {
  const kw = String(focusKeywords || "")
    .split(/[,،]/)
    .map((x) => x.trim())
    .filter(Boolean)[0] || name;
  return [
    {
      q: `${name || kw} مناسب چه فصلی است؟`,
      a: `بسته به جنس پارچه، ${name || "این محصول"} برای استفاده در فصل مناسب طراحی شده است. جزئیات در توضیحات محصول آمده است.`,
    },
    {
      q: `راهنمای سایز ${name || "محصول"} چگونه است؟`,
      a: "از جدول راهنمای سایز فروشگاه استفاده کنید و در صورت تردید با پشتیبانی فروشنده در تماس باشید.",
    },
    {
      q: `ارسال و مرجوعی ${name || "این کالا"} چگونه است؟`,
      a: "پس از ثبت سفارش، ارسال طبق روش انتخابی انجام می‌شود. شرایط مرجوعی در صفحه قوانین مرجوعی فروشگاه آمده است.",
    },
  ];
}

export function aiOptimizeTextHints({ title = "", description = "", bodyText = "", focusKeywords = "" } = {}) {
  const hints = [];
  const primary = String(focusKeywords || "")
    .split(/[,،]/)
    .map((x) => x.trim())
    .filter(Boolean)[0];
  if (!title) hints.push("یک عنوان سئو در محدوده پیکسل گوگل (دسکتاپ ≤۶۰۰px) بنویسید.");
  else if (seoPixelReport(title, "title").worst === "short") hints.push("عنوان را کمی طولانی‌تر و توصیفی‌تر کنید.");
  else if (seoPixelReport(title, "title").deskOver) hints.push("عنوان برای دسکتاپ گوگل بلند است (≤۶۰۰px).");
  if (!description) hints.push("توضیحات متا در محدوده پیکسل گوگل (دسکتاپ ≤۹۶۰px) اضافه کنید.");
  else if (seoPixelReport(description, "desc").deskOver) hints.push("توضیحات متا برای دسکتاپ بلند است (≤۹۶۰px).");
  if (primary && title && !title.includes(primary)) hints.push(`کلمه «${primary}» را در عنوان سئو بیاورید.`);
  if (primary && bodyText && !String(bodyText).includes(primary))
    hints.push(`یک‌بار «${primary}» را طبیعی در متن توضیح بنویسید.`);
  if (String(bodyText || "").split(/\s+/).filter(Boolean).length < 80)
    hints.push("توضیح محصول را به حداقل ۸۰–۱۵۰ کلمه برسانید.");
  if (!hints.length) hints.push("وضعیت سئو قابل قبول است؛ روی لینک داخلی و تصویر با alt تمرکز کنید.");
  return hints;
}

export function buildImageAltFromTemplate(p, seoCfg) {
  const s = seoCfg || {};
  if (s.imageSeoAutoAlt === false) return p?.imageAlt || p?.name || "";
  const tpl = s.imageSeoAltTemplate || "{name} | {brand} | پیراهن مردانه";
  return tpl
    .replace(/\{name\}/g, p?.name || "")
    .replace(/\{brand\}/g, p?.brand || p?.brandName || "")
    .replace(/\{category\}/g, p?.category || "")
    .replace(/\{keyword\}/g, String(p?.seoFocusKeywords || "").split(/[,،]/)[0] || p?.name || "")
    .replace(/\s+\|/g, " |")
    .trim();
}

export function buildFaqSchema(faqs) {
  const items = (faqs || []).filter((f) => f && f.q && f.a);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
