/**
 * Content SEO editor box — extracted from App.jsx (قدم ۶۵)
 * Helpers can be passed via opts._seoHelpers or fall back to imports.
 */
"use client";

import { seoPixelReport } from "@/lib/seo-pixel";

export default function ContentSeoBox(opts) {
  const helpers = (opts && opts._seoHelpers) || {};
  const seoCfg = helpers.seoCfg || (() => ({}));
  const seoPixelReport = helpers.seoPixelReport || (typeof globalThis !== "undefined" && globalThis.seoPixelReport) || (() => ({ chars: 0, tone: "ok", label: "" }));
  const aiGenerateSeoMeta = helpers.aiGenerateSeoMeta;
  const aiSuggestFaq = helpers.aiSuggestFaq;
  const suggestInternalLinks = helpers.suggestInternalLinks;
  const getSeoAiQuotaState = helpers.getSeoAiQuotaState;
  const checkSellerSeoSpam = helpers.checkSellerSeoSpam;
  const pushLiveToast = helpers.pushLiveToast || (() => {});

        const {
          mode = 'product',
          title = '',
          description = '',
          focusKeywords = '',
          canonical = '',
          ogImage = '',
          noindex = false,
          onChange,
          sellerLimited = false,
          previewUrl = '',
          bodyText = '',
          contentTitle = '',
          hasImage = false,
          imageHasAlt = false,
          imageAlt = '',
          sellerId = null,
          faqItems = null,
          onFaqChange = null,
          analysisOnly = false,
          hideAnalysis = false,
          sellerStep2 = false,
          seoPart = null,
          adminSeoLayout = false,
          showAdminIndexCanonical = false,
        } = opts || {};
        const titleReport = seoPixelReport(title, 'title');
        const descReport = seoPixelReport(description, 'desc');
        const titleHint = { n: titleReport.chars, tone: titleReport.tone, label: titleReport.label, report: titleReport };
        const descHint = { n: descReport.chars, tone: descReport.tone, label: descReport.label, report: descReport };
        const siteName = seoCfg().siteTitle || 'پیراهن مردانه';
        const base = (seoCfg().canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const serpUrl = previewUrl || base + '/…';
        const kwLimit = sellerLimited ? 3 : 5;
        const kwCount = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean).length;
        const analysis = analyzeOnPageSeo({
          title, description, focusKeywords, bodyText, contentTitle, url: previewUrl || '',
          hasImage, imageHasAlt, sellerLimited,
        });
        const linkIdeas = suggestInternalLinks({ focusKeywords, bodyText, sellerLimited, sellerId });
        const trafficColor = analysis.traffic === 'green' ? 'bg-emerald-500' : analysis.traffic === 'orange' ? 'bg-amber-400' : 'bg-red-500';
        const trafficLabel = analysis.traffic === 'green' ? 'خوب' : analysis.traffic === 'orange' ? 'نیاز به بهبود' : 'ضعیف';
        if (analysisOnly) {
          return (
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-analysis="1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-1.5">
                  <Icon name="search" size={16} /> تحلیل لحظه‌ای
                </p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${trafficColor}`}>
                  <span className="w-2 h-2 rounded-full bg-white/90" /> {toFa(analysis.score)} · {trafficLabel}
                </span>
              </div>
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-primary-700 dark:text-white mb-1">تحلیل لحظه‌ای</p>
                {analysis.checks.map(c => (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.status === 'good' ? 'bg-emerald-500' : c.status === 'ok' ? 'bg-amber-400' : 'bg-red-500'}`} />
                    <div className="min-w-0">
                      <span className="font-medium text-primary-800 dark:text-white">{c.label}</span>
                      <span className="text-primary-500 dark:text-white/60"> — {c.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (sellerStep2) {
          const partTitle =
            seoPart === 'keywords' ? '۱۱. کلمات کلیدی' :
            seoPart === 'title' ? '۱۲. عنوان سئو (SEO Title)+پیش‌نمایش گوگل' :
            seoPart === 'desc' ? '۱۳. توضیحات متا (Meta Description)+پیش‌نمایش گوگل' :
            seoPart === 'faq' ? '۱۴. FAQ (Schema)' :
            seoPart === 'social' ? '۱۵. پیش‌نمایش شبکه اجتماعی' :
            seoPart === 'ai' ? '۱۶. پیشنهاد هوشمند (AI محلی)' :
            null;
          const show = (p) => (seoPart ? seoPart === p : true);
          return (
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-box="seller-step2">
              {partTitle && <p className="text-sm font-bold text-primary-900 dark:text-white">{partTitle}</p>}
              {show('keywords') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">کلمات کلیدی فوکوس (با ویرگول) · حداکثر ۳</label>
                  <span className={`text-xs ${kwCount > kwLimit ? 'text-red-300' : 'text-primary-400'}`}>{kwCount}/{kwLimit}</span>
                </div>
                <input
                  value={focusKeywords}
                  onChange={e => {
                    let v = e.target.value;
                    const parts = v.split(/[,،]/).map(x => x.trim()).filter(Boolean);
                    if (parts.length > kwLimit) v = parts.slice(0, kwLimit).join('، ');
                    onChange?.({ focusKeywords: v });
                  }}
                  placeholder="حداکثر ۳ کلمه"
                  className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
                />
              </div>
              )}
              {show('title') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">عنوان صفحه (SEO Title)</label>
                  <span className={`text-xs ${titleHint.tone}`}>{titleHint.label}</span>
                </div>
                <input value={title} onChange={e => onChange?.({ title: e.target.value })} maxLength={90} placeholder="خالی = نام محصول" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                <SeoPixelBars report={titleReport} />
              </div>
              )}
              {show('desc') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">توضیحات متا (Meta Description)</label>
                  <span className={`text-xs ${descHint.tone}`}>{descHint.label}</span>
                </div>
                <textarea value={description} onChange={e => onChange?.({ description: e.target.value })} rows={3} maxLength={320} placeholder="توضیح کوتاه نتایج گوگل" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white resize-y min-h-[80px]" />
                <SeoPixelBars report={descReport} />
              </div>
              )}
              {show('faq') && onFaqChange && (
                <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-primary-700 dark:text-white">FAQ (Schema)</p>
                    <button type="button" className="text-xs text-apple-blue" onClick={() => onFaqChange([...(faqItems || []), { q: '', a: '' }])}>+ پرسش</button>
                  </div>
                  {(faqItems || []).map((f, i) => (
                    <div key={i} className="space-y-1 p-2 rounded-lg border border-primary-50 dark:border-white/5">
                      <input value={f.q || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], q: e.target.value }; onFaqChange(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" />
                      <textarea value={f.a || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], a: e.target.value }; onFaqChange(next); }} placeholder="پاسخ" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs resize-y" />
                      <button type="button" className="text-xs text-red-300" onClick={() => onFaqChange(faqItems.filter((_, j) => j !== i))}>حذف</button>
                    </div>
                  ))}
                  {!(faqItems || []).length && <p className="text-xs text-primary-400">خالی · از «پیشنهاد FAQ» یا افزودن دستی استفاده کنید</p>}
                </div>
              )}
              {show('ai') && (
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs font-bold text-primary-700 dark:text-white">پیشنهاد هوشمند (AI محلی)</p>
                  <span className="text-xs text-primary-400">باقیمانده امروز: {toFa(getSeoAiQuota(sellerLimited ? 'seller' : 'admin').left)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full bg-apple-blue text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ title: g.title, description: g.description, focusKeywords: g.focusKeywords || focusKeywords });
                    showToast({ message: g.summary, variant: 'default', duration: 7000, position: 'top-center' });
                  }}>پیشنهاد کامل</button>
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ title: g.title });
                    showToast({ message: 'عنوان پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>عنوان</button>
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ description: g.description });
                    showToast({ message: 'خلاصه متا پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>خلاصه</button>
                  {onFaqChange && (
                    <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                      const role = sellerLimited ? 'seller' : 'admin';
                      if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                      onFaqChange(aiSuggestFaq({ name: contentTitle, desc: bodyText, focusKeywords }));
                      showToast({ message: 'FAQ پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                    }}>پیشنهاد FAQ</button>
                  )}
                </div>
              </div>
              )}
              {show('social') && (
              <div className="seo-social-preview rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 overflow-hidden">
                <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 px-3 pt-2.5 pb-1.5">پیش‌نمایش شبکه اجتماعی</p>
                <div className="aspect-[1.91/1] max-h-28 bg-primary-100 dark:bg-[#1A1C20] flex flex-col items-center justify-center gap-1.5 overflow-hidden border-y border-primary-100 dark:border-white/15">
                  {ogImage || hasImage ? (
                    <img src={ogImage || undefined} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-700 border border-primary-300 dark:border-white/30">
                        <Icon name="image" size={18} className="text-primary-600 dark:!text-white" />
                      </span>
                      <span className="text-xs font-medium text-primary-600 dark:!text-white/85">بدون تصویر OG</span>
                    </>
                  )}
                </div>
                <div className="p-2.5 space-y-1 bg-white dark:bg-primary-800">
                  <p className="text-xs text-primary-500 dark:!text-white/70 truncate" dir="ltr">{base.replace(/^https?:\/\//, '')}</p>
                  <p className="text-sm font-bold text-primary-900 dark:!text-white line-clamp-2">{title || contentTitle || 'عنوان'}</p>
                  <p className="text-xs text-primary-600 dark:!text-white/80 line-clamp-2">{description || 'توضیح…'}</p>
                </div>
              </div>
              )}
              {(show('title') || show('desc')) && (
              <div className="rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 p-3 space-y-3">
                <p className="text-xs font-semibold text-primary-600 dark:!text-white/90">پیش‌نمایش گوگل (پیکسل دسکتاپ / موبایل)</p>
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-primary-500">دسکتاپ · عنوان ≤{SEO_PX_LIMITS.titleDesktop}px · متا ≤{SEO_PX_LIMITS.descDesktop}px</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate" dir="ltr">{serpUrl}</p>
                  <p className="text-base text-blue-700 dark:text-blue-400 font-medium" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif', fontSize: 20 }}>{title || 'عنوان سئو (خالی = نام محتوا)'}</p>
                  <p className="text-xs text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descDesktop, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 14 }}>{description || 'توضیحات متا اینجا نمایش داده می‌شود…'}</p>
                  {(titleReport.deskOver || descReport.deskOver) && <p className="text-[10px] text-red-300">در دسکتاپ بخشی از متن بریده می‌شود</p>}
                </div>
                <div className="space-y-1 pt-2 border-t border-primary-100 dark:border-white/10">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate" dir="ltr">{serpUrl}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium" style={{ maxWidth: SEO_PX_LIMITS.titleMobile, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif', fontSize: 16 }}>{title || 'عنوان سئو (خالی = نام محتوا)'}</p>
                  <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descMobile, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 12 }}>{description || 'توضیحات متا اینجا نمایش داده می‌شود…'}</p>
                  {(titleReport.mobOver || descReport.mobOver) && <p className="text-[10px] text-red-300">در موبایل بخشی از متن بریده می‌شود</p>}
                </div>
              </div>
              )}
            </div>
          );
        }

        if (adminSeoLayout) {
          const show = (p) => !seoPart || seoPart === p;
          const stepTitle =
            seoPart === 'keywords' ? '۱. کلمات کلیدی' :
            seoPart === 'title' ? '۲. عنوان سئو (SEO Title)+پیش‌نمایش گوگل' :
            seoPart === 'desc' ? '۳. توضیحات متا (Meta Description)+پیش‌نمایش گوگل' :
            seoPart === 'faq' ? '۴. FAQ (Schema)' :
            seoPart === 'index' ? '۵. ایندکس' :
            seoPart === 'canonical' ? '۶. کنونیکال' :
            seoPart === 'social' ? '۷. پیش‌نمایش شبکه اجتماعی' :
            seoPart === 'ai' ? '۸. پیشنهاد هوشمند (AI محلی)' :
            null;
          return (
            <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-box="admin-layout">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-1.5">
                  <Icon name="search" size={16} /> {stepTitle || (`سئو ${mode === 'article' ? 'مطلب' : mode === 'category' ? 'دسته' : mode === 'brand' ? 'برند' : 'صفحه'}`)}
                </p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${trafficColor}`}>
                  <span className="w-2 h-2 rounded-full bg-white/90" /> {toFa(analysis.score)} · {trafficLabel}
                </span>
              </div>

              {show('keywords') && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs text-primary-500">کلمات کلیدی فوکوس (با ویرگول) · حداکثر ۳</label>
                  <span className={`text-xs ${kwCount > kwLimit ? 'text-red-300' : 'text-primary-400'}`}>{kwCount}/{kwLimit}</span>
                </div>
                <input value={focusKeywords} onChange={e => { let v = e.target.value; const parts = v.split(/[,،]/).map(x => x.trim()).filter(Boolean); if (parts.length > kwLimit) v = parts.slice(0, kwLimit).join('، '); onChange?.({ focusKeywords: v }); }} placeholder="حداکثر ۳ کلمه" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
              </div>
              )}

              {show('title') && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs text-primary-500">عنوان صفحه (SEO Title)</label>
                    <span className={`text-xs ${titleHint.tone}`}>{titleHint.label}</span>
                  </div>
                  <input value={title} onChange={e => onChange?.({ title: e.target.value })} maxLength={90} placeholder="عنوان نمایش در گوگل" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white" />
                  <SeoPixelBars report={titleReport} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · دسکتاپ</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-latin" dir="ltr" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{previewUrl || 'https://example.com/page'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descDesktop, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 13 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · موبایل</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleMobile, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descMobile, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 12 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                </div>
              </div>
              )}

              {show('desc') && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs text-primary-500">توضیحات متا (Meta Description)</label>
                    <span className={`text-xs ${descHint.tone}`}>{descHint.label}</span>
                  </div>
                  <textarea value={description} onChange={e => onChange?.({ description: e.target.value })} rows={3} maxLength={200} placeholder="توضیح کوتاه برای نتایج گوگل" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white resize-y" />
                  <SeoPixelBars report={descReport} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · دسکتاپ</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-latin" dir="ltr" style={{ maxWidth: SEO_PX_LIMITS.titleDesktop, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{previewUrl || 'https://example.com/page'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descDesktop, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 13 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                  <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary-500">پیش‌نمایش گوگل · موبایل</p>
                    <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] leading-snug" style={{ maxWidth: SEO_PX_LIMITS.titleMobile, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'arial, sans-serif' }}>{title || 'عنوان سئو'}</p>
                    <p className="text-[11px] text-primary-600 dark:text-white/70" style={{ maxWidth: SEO_PX_LIMITS.descMobile, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'arial, sans-serif', fontSize: 12 }}>{description || 'توضیحات متا…'}</p>
                  </div>
                </div>
              </div>
              )}

              {show('faq') && onFaqChange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-primary-800 dark:text-white">FAQ (Schema)</p>
                  <button type="button" className="text-xs text-apple-blue" onClick={() => onFaqChange([...(faqItems || []), { q: '', a: '' }])}>+ پرسش</button>
                </div>
                {(faqItems || []).map((it, idx) => (
                  <div key={idx} className="p-2 rounded-xl border border-primary-100 dark:border-white/10 space-y-1.5">
                    <input value={it.q || ''} onChange={e => { const next = [...faqItems]; next[idx] = { ...next[idx], q: e.target.value }; onFaqChange(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white" />
                    <textarea value={it.a || ''} onChange={e => { const next = [...faqItems]; next[idx] = { ...next[idx], a: e.target.value }; onFaqChange(next); }} placeholder="پاسخ" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-primary-900 dark:text-white resize-y" />
                    <button type="button" className="text-xs text-red-300" onClick={() => onFaqChange(faqItems.filter((_, j) => j !== idx))}>حذف</button>
                  </div>
                ))}
                {!(faqItems || []).length && <p className="text-xs text-primary-400">خالی · از «پیشنهاد FAQ» یا افزودن دستی استفاده کنید</p>}
              </div>
              )}

              {show('index') && (
              <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-3">
                <p className="text-xs font-bold text-primary-800 dark:text-white">ایندکس</p>
                <label className="flex items-center justify-between gap-3 py-1">
                  <span className="text-xs text-primary-800 dark:text-white">ایندکس در موتورهای جستجو</span>
                  <button type="button" role="switch" aria-checked={!noindex} onClick={() => onChange?.({ noindex: !noindex })} dir="ltr" className={`relative inline-flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${!noindex ? 'bg-emerald-500' : 'bg-primary-300 dark:bg-primary-600'}`}>
                    <span className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${!noindex ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </label>
                <p className="text-[10px] text-primary-400">{noindex ? 'noindex, nofollow' : 'index, follow'}</p>
              </div>
              )}

              {show('canonical') && (
              <div className="rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 p-3 space-y-2">
                <p className="text-xs font-bold text-primary-800 dark:text-white">کنونیکال</p>
                <label className="text-xs text-primary-500 mb-1 block">آدرس کنونیکال (Canonical)</label>
                <input value={canonical || ''} onChange={e => onChange?.({ canonical: e.target.value })} dir="ltr" placeholder="خالی = آدرس پیش‌فرض صفحه" className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-transparent text-sm text-left font-latin text-primary-900 dark:text-white" />
              </div>
              )}

              {show('social') && (
              <div className="seo-social-preview rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 overflow-hidden">
                <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 px-3 pt-2.5 pb-1.5">پیش‌نمایش شبکه اجتماعی</p>
                <div className="aspect-[1.91/1] max-h-28 bg-primary-100 dark:bg-[#1A1C20] flex items-center justify-center overflow-hidden border-y border-primary-100 dark:border-white/15">
                  {(ogImage || hasImage) ? (
                    <img src={ogImage || undefined} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-xs text-primary-400 dark:text-white/50 flex flex-col items-center gap-1"><Icon name="image" size={22} /> بدون تصویر OG</span>
                  )}
                </div>
                <div className="px-3 py-2 space-y-0.5">
                  <p className="text-[10px] text-primary-400 font-latin" dir="ltr">{(previewUrl || '').replace(/^https?:\/\//, '') || 'example.com'}</p>
                  <p className="text-sm font-bold text-primary-900 dark:text-white line-clamp-2">{title || 'عنوان'}</p>
                  <p className="text-xs text-primary-500 dark:text-white/70 line-clamp-2">{description || 'توضیحات…'}</p>
                </div>
                <div className="px-3 pb-3">
                  <label className="text-[10px] text-primary-400 block mb-1">تصویر OG / شبکه اجتماعی</label>
                  <input value={ogImage || ''} onChange={e => onChange?.({ ogImage: e.target.value })} dir="ltr" placeholder="https://..." className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/20 bg-transparent text-xs text-left" />
                </div>
              </div>
              )}

              {show('ai') && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-primary-800 dark:text-white">پیشنهاد هوشمند (AI محلی)</p>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    if (!consumeSeoAiQuota('admin')) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                    onChange?.({ title: g.title || title, description: g.description || description });
                    showToast({ message: 'Title/Meta تولید شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>تولید Title/Meta</button>
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    if (!consumeSeoAiQuota('admin')) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    const g = aiGenerateSeoMeta({ name: contentTitle || title, desc: bodyText || description, focusKeywords, mode });
                    onChange?.({ title: g.title || title, description: g.description || description });
                    const hints = aiOptimizeTextHints({ title: g.title || title, description: g.description || description, bodyText, focusKeywords });
                    showToast({ message: hints[0] || 'بهینه‌سازی اعمال شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>بهینه‌سازی</button>
                  {onFaqChange && (
                    <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                      if (!consumeSeoAiQuota('admin')) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                      onFaqChange(aiSuggestFaq({ name: contentTitle, desc: bodyText, focusKeywords }));
                      showToast({ message: '۳ پرسش‌وپاسخ پیشنهادی اضافه شد', variant: 'success', duration: 3500, position: 'top-center' });
                    }}>پیشنهاد FAQ</button>
                  )}
                </div>
              </div>
              )}
            </div>
          );
        }

        return (
          <div className="rounded-2xl border border-primary-200 dark:border-white/15 bg-primary-50/40 dark:bg-primary-900/20 p-3 sm:p-4 space-y-3" data-seo-box="1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-1.5">
                <Icon name="search" size={16} /> سئو {mode === 'product' ? 'محصول' : mode === 'article' ? 'مطلب' : 'صفحه'}
              </p>
              <div className="flex items-center gap-2">
                {sellerLimited && <span className="text-xs text-primary-500">فروشنده · حداکثر {kwLimit} کلیدواژه</span>}
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${trafficColor}`}>
                  <span className="w-2 h-2 rounded-full bg-white/90" /> {toFa(analysis.score)} · {trafficLabel}
                </span>
              </div>
            </div>
            {/* SERP preview */}
            <div className="rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 p-3 space-y-1">
              <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 mb-1">پیش‌نمایش گوگل</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 truncate" dir="ltr">{serpUrl}</p>
              <p className="text-base text-blue-700 dark:text-blue-400 font-medium line-clamp-2">{title || 'عنوان سئو (خالی = نام محتوا)'}</p>
              <p className="text-xs text-primary-600 dark:text-white/70 line-clamp-2">{description || 'توضیحات متا اینجا نمایش داده می‌شود…'}</p>
            </div>
            {/* Social preview */}
            <div className="seo-social-preview rounded-xl border border-primary-200 dark:border-white/25 bg-white dark:bg-primary-800 overflow-hidden">
              <p className="text-xs font-semibold text-primary-600 dark:!text-white/90 px-3 pt-2.5 pb-1.5">پیش‌نمایش شبکه اجتماعی</p>
              <div className="aspect-[1.91/1] max-h-28 bg-primary-100 dark:bg-[#1A1C20] flex flex-col items-center justify-center gap-1.5 overflow-hidden border-y border-primary-100 dark:border-white/15">
                {ogImage || hasImage ? (
                  <img src={ogImage || undefined} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <>
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-700 border border-primary-300 dark:border-white/30">
                      <Icon name="image" size={18} className="text-primary-600 dark:!text-white" />
                    </span>
                    <span className="text-xs font-medium text-primary-600 dark:!text-white/85">بدون تصویر OG</span>
                  </>
                )}
              </div>
              <div className="p-2.5 space-y-1 bg-white dark:bg-primary-800">
                <p className="text-xs text-primary-500 dark:!text-white/70 truncate" dir="ltr">{base.replace(/^https?:\/\//, '')}</p>
                <p className="text-sm font-bold text-primary-900 dark:!text-white line-clamp-2">{title || contentTitle || 'عنوان'}</p>
                <p className="text-xs text-primary-600 dark:!text-white/80 line-clamp-2">{description || 'توضیح…'}</p>
              </div>
            </div>
            {/* Checklist */}
            {/* فاز C: ابزارهای AI محلی */}
            <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs font-bold text-primary-700 dark:text-white">پیشنهاد هوشمند</p>
                <span className="text-xs text-primary-400">باقیمانده امروز: {toFa(getSeoAiQuota(sellerLimited ? 'seller' : 'admin').left)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className="text-xs px-2.5 py-1.5 rounded-full bg-apple-blue text-white" onClick={() => {
                  const role = sellerLimited ? 'seller' : 'admin';
                  if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                  const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                  onChange?.({ title: g.title, description: g.description });
                  showToast({ message: 'عنوان و متا پیشنهاد شد', variant: 'success', duration: 3500, position: 'top-center' });
                }}>تولید Title/Meta</button>
                <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                  const role = sellerLimited ? 'seller' : 'admin';
                  if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                  const hints = aiOptimizeTextHints({ title, description, bodyText, focusKeywords });
                  showToast({ message: hints[0] + (hints[1] ? ' · ' + hints[1] : ''), variant: 'default', duration: 6000, position: 'top-center' });
                }}>بهینه‌سازی</button>
                <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                  const role = sellerLimited ? 'seller' : 'admin';
                  if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                  const g = aiGenerateSeoMeta({ name: contentTitle, desc: bodyText, focusKeywords, mode });
                  showToast({ message: g.summary, variant: 'default', duration: 7000, position: 'top-center' });
                }}>خلاصه</button>
                {onFaqChange && (
                  <button type="button" className="text-xs px-2.5 py-1.5 rounded-full border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white" onClick={() => {
                    const role = sellerLimited ? 'seller' : 'admin';
                    if (!consumeSeoAiQuota(role)) { showToast({ message: 'سقف روزانه AI پر شده است', variant: 'error', duration: 4000, position: 'top-center' }); return; }
                    onFaqChange(aiSuggestFaq({ name: contentTitle, desc: bodyText, focusKeywords }));
                    showToast({ message: '۳ پرسش‌وپاسخ پیشنهادی اضافه شد', variant: 'success', duration: 3500, position: 'top-center' });
                  }}>پیشنهاد FAQ</button>
                )}
              </div>
            </div>
            {/* FAQ items */}
            {Array.isArray(faqItems) && onFaqChange && (
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary-700 dark:text-white">FAQ (Schema)</p>
                  <button type="button" className="text-xs text-apple-blue" onClick={() => onFaqChange([...(faqItems || []), { q: '', a: '' }])}>+ پرسش</button>
                </div>
                {(faqItems || []).map((f, i) => (
                  <div key={i} className="space-y-1 p-2 rounded-lg border border-primary-50 dark:border-white/5">
                    <input value={f.q || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], q: e.target.value }; onFaqChange(next); }} placeholder="سؤال" className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs" />
                    <textarea value={f.a || ''} onChange={e => { const next = [...faqItems]; next[i] = { ...next[i], a: e.target.value }; onFaqChange(next); }} placeholder="پاسخ" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-primary-200 dark:border-white/15 bg-transparent text-xs resize-y" />
                    <button type="button" className="text-xs text-red-300" onClick={() => onFaqChange(faqItems.filter((_, j) => j !== i))}>حذف</button>
                  </div>
                ))}
                {!(faqItems || []).length && <p className="text-xs text-primary-400">خالی · از «پیشنهاد FAQ» یا افزودن دستی استفاده کنید</p>}
              </div>
            )}
            {/* Internal links */}
            {linkIdeas.length > 0 && (
              <div className="rounded-xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900 p-3 space-y-2">
                <p className="text-xs font-bold text-primary-700 dark:text-white">پیشنهاد لینک داخلی {sellerLimited ? '(فقط محصولات شما)' : ''}</p>
                <ul className="space-y-1">
                  {linkIdeas.map(l => (
                    <li key={l.id} className="text-xs flex items-center justify-between gap-2">
                      <span className="text-primary-800 dark:text-white truncate">{l.name}</span>
                      <span className="text-primary-400 font-latin text-xs flex-shrink-0" dir="ltr">{l.path}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-primary-400">{sellerLimited ? 'لینک خارجی مجاز نیست · از محصولات خودتان در توضیح استفاده کنید.' : 'می‌توانید در متن به این صفحات لینک دهید.'}</p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-primary-500">عنوان سئو (SEO Title)</label>
                <span className={`text-xs ${titleHint.tone}`}>{titleHint.label}</span>
              </div>
              <input
                value={title}
                onChange={e => onChange?.({ title: e.target.value })}
                maxLength={70}
                placeholder="مثلاً خرید پیراهن رسمی مردانه مشکی"
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-primary-500 block">تصویر شاخص (Featured / OG)</label>
              <div className="flex flex-wrap items-start gap-3">
                <div className="w-28 h-28 rounded-xl border border-primary-200 dark:border-white/15 bg-primary-100 dark:bg-primary-900 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {ogImage ? (
                    <img src={ogImage} alt={imageAlt || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-[10px] text-primary-400 text-center px-1">بدون تصویر</span>
                  )}
                </div>
                <div className="flex-1 min-w-[12rem] space-y-2">
                  <label className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border border-primary-200 dark:border-white/20 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 text-primary-800 dark:text-white">
                    <Icon name="plus" size={14} /> بارگذاری تصویر
                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await processProductImageFile(file, { folder: 'admin' });
                          onChange?.({ ogImage: url });
                        } catch (err) {
                          showToast({ message: String(err?.message || 'خطا در تبدیل WebP'), variant: 'error', duration: 4000, position: 'top-center' });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <input
                    value={ogImage && !String(ogImage).startsWith('data:') ? ogImage : ''}
                    onChange={(e) => onChange?.({ ogImage: e.target.value })}
                    dir="ltr"
                    placeholder="یا آدرس تصویر (https://…)"
                    className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-xs text-left font-latin text-primary-900 dark:text-white"
                  />
                  {ogImage ? (
                    <button type="button" onClick={() => onChange?.({ ogImage: '' })} className="text-xs text-red-300">حذف تصویر</button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="text-xs text-primary-500 mb-1 block">تگ Alt تصویر شاخص</label>
                <input
                  value={imageAlt}
                  onChange={(e) => onChange?.({ imageAlt: e.target.value })}
                  placeholder="توضیح کوتاه تصویر برای سئو و دسترس‌پذیری"
                  className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-primary-500">توضیحات متا (Meta Description)</label>
                <span className={`text-xs ${descHint.tone}`}>{descHint.label}</span>
              </div>
              <textarea
                value={description}
                onChange={e => onChange?.({ description: e.target.value })}
                rows={3}
                maxLength={180}
                placeholder="خلاصه جذاب برای نتایج گوگل…"
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white resize-y min-h-[80px]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-primary-500">کلمات کلیدی فوکوس (با ویرگول)</label>
                <span className={`text-xs ${kwCount > kwLimit ? 'text-red-300' : 'text-primary-400'}`}>{kwCount}/{kwLimit}</span>
              </div>
              <input
                value={focusKeywords}
                onChange={e => {
                  let v = e.target.value;
                  const parts = v.split(/[,،]/).map(x => x.trim()).filter(Boolean);
                  if (parts.length > kwLimit) v = parts.slice(0, kwLimit).join('، ');
                  onChange?.({ focusKeywords: v });
                }}
                placeholder={sellerLimited ? 'حداکثر ۳ کلمه' : 'حداکثر ۵ کلمه'}
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-primary-900 dark:text-white"
              />
            </div>
            {!sellerLimited && (
              <>
                <div>
                  <label className="text-xs text-primary-500 mb-1 block">Canonical (اختیاری)</label>
                  <input
                    value={canonical}
                    onChange={e => onChange?.({ canonical: e.target.value })}
                    dir="ltr"
                    placeholder="https://…"
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-900 text-sm text-left font-latin text-primary-900 dark:text-white"
                  />
                </div>
                {/* OG URL در بخش تصویر شاخص بالاتر مدیریت می‌شود */}
                <label className="flex items-center gap-2 text-xs text-primary-700 dark:text-white cursor-pointer">
                  <input type="checkbox" checked={!!noindex} onChange={e => onChange?.({ noindex: e.target.checked })} />
                  noindex این محتوا (ایندکس نشود)
                </label>
              </>
            )}
            <p className="text-xs text-primary-400">خالی بماند ← از نام/توضیح محتوا استفاده می‌شود.</p>
          </div>
        );
      }
