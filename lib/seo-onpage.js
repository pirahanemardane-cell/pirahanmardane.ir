/** تحلیل on-page سئو (فارسی‌محور) */

import { seoPixelReport } from "@/lib/seo-pixel";

export function analyzeOnPageSeo({
        title = '',
        description = '',
        focusKeywords = '',
        bodyText = '',
        contentTitle = '',
        url = '',
        hasImage = false,
        imageHasAlt = false,
        sellerLimited = false,
      } = {}) {
        const checks = [];
        const add = (id, label, status, detail) => checks.push({ id, label, status, detail }); // status: good | ok | bad
        const body = String(bodyText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = body ? body.split(/\s+/).filter(Boolean) : [];
        const wordCount = words.length;
        const kws = String(focusKeywords || '').split(/[,،]/).map(x => x.trim()).filter(Boolean);
        const primary = (kws[0] || '').toLowerCase();
        const titleL = String(title || '').toLowerCase();
        const descL = String(description || '').toLowerCase();
        const bodyL = body.toLowerCase();
        const contentTitleL = String(contentTitle || '').toLowerCase();
        const tLen = String(title || '').length;
        const dLen = String(description || '').length;
        const tPx = seoPixelReport(title, 'title');
        const dPx = seoPixelReport(description, 'desc');

        // Title length — بر اساس پیکسل گوگل
        if (!tLen) add('title-empty', 'عنوان سئو', 'bad', 'خالی است');
        else if (tPx.deskOver || tPx.mobOver) add('title-long', 'طول عنوان سئو (پیکسل)', 'ok', `دسکتاپ ${tPx.deskPx}/${tPx.deskLim}px · موبایل ${tPx.mobPx}/${tPx.mobLim}px · بلند`);
        else if (tPx.worst === 'short') add('title-short', 'طول عنوان سئو (پیکسل)', 'ok', `دسکتاپ ${tPx.deskPx}/${tPx.deskLim}px · کوتاه`);
        else add('title-len', 'طول عنوان سئو (پیکسل)', 'good', `دسکتاپ ${tPx.deskPx}/${tPx.deskLim}px · موبایل ${tPx.mobPx}/${tPx.mobLim}px`);

        // Description length — پیکسل
        if (!dLen) add('desc-empty', 'توضیحات متا', 'bad', 'خالی است');
        else if (dPx.deskOver || dPx.mobOver) add('desc-long', 'طول متا (پیکسل)', 'ok', `دسکتاپ ${dPx.deskPx}/${dPx.deskLim}px · موبایل ${dPx.mobPx}/${dPx.mobLim}px · بلند`);
        else if (dPx.worst === 'short') add('desc-short', 'طول متا (پیکسل)', 'ok', `دسکتاپ ${dPx.deskPx}/${dPx.deskLim}px · کوتاه`);
        else add('desc-len', 'طول متا (پیکسل)', 'good', `دسکتاپ ${dPx.deskPx}/${dPx.deskLim}px · موبایل ${dPx.mobPx}/${dPx.mobLim}px`);

        // Focus keyword
        if (!primary) add('kw-missing', 'کلمه کلیدی فوکوس', 'bad', 'تعریف نشده');
        else {
          add('kw-set', 'کلمه کلیدی فوکوس', 'good', primary);
          if (titleL.includes(primary)) add('kw-title', 'کلیدواژه در عنوان سئو', 'good', 'وجود دارد');
          else add('kw-title', 'کلیدواژه در عنوان سئو', 'bad', 'نیست');
          if (descL.includes(primary)) add('kw-desc', 'کلیدواژه در متا', 'good', 'وجود دارد');
          else add('kw-desc', 'کلیدواژه در متا', 'ok', 'پیشنهاد: در متا هم بیاید');
          if (contentTitleL && contentTitleL.includes(primary)) add('kw-h1', 'کلیدواژه در نام/عنوان محتوا', 'good', 'وجود دارد');
          else if (contentTitle) add('kw-h1', 'کلیدواژه در نام/عنوان محتوا', 'ok', 'اختیاری ولی مفید');
          if (bodyL) {
            if (bodyL.includes(primary)) {
              const dens = wordCount ? (bodyL.split(primary).length - 1) / wordCount * 100 : 0;
              if (dens > 0 && dens < 0.5) add('kw-dens', 'چگالی کلیدواژه', 'ok', `حدود ${dens.toFixed(1)}٪ · کم`);
              else if (dens > 3) add('kw-dens', 'چگالی کلیدواژه', 'ok', `حدود ${dens.toFixed(1)}٪ · زیاد`);
              else add('kw-dens', 'چگالی کلیدواژه', 'good', `حدود ${dens.toFixed(1)}٪`);
            } else add('kw-body', 'کلیدواژه در متن', 'bad', 'در بدنه محتوا نیست');
          }
        }

        // Content length
        if (!body) add('body-empty', 'متن محتوا', 'ok', 'متن خالی · برای محصول توضیح اضافه کنید');
        else if (wordCount < 50) add('body-short', 'طول محتوا', 'ok', `${wordCount} کلمه · کوتاه`);
        else if (wordCount < 150) add('body-mid', 'طول محتوا', 'ok', `${wordCount} کلمه · متوسط`);
        else add('body-len', 'طول محتوا', 'good', `${wordCount} کلمه`);

        // Readability rough (Persian): avg sentence length by .
        if (body) {
          const sentences = body.split(/[.!?؟۔]+/).map(s => s.trim()).filter(Boolean);
          const avg = sentences.length ? words.length / sentences.length : words.length;
          if (avg > 35) add('read-sent', 'طول جملات', 'ok', `میانگین ~${Math.round(avg)} کلمه · جملات را کوتاه‌تر کنید`);
          else if (sentences.length) add('read-sent', 'طول جملات', 'good', `میانگین ~${Math.round(avg)} کلمه`);
          const paras = body.split(/\n+/).filter(Boolean);
          if (paras.some(p => p.split(/\s+/).length > 120)) add('read-para', 'طول پاراگراف', 'ok', 'حداقل یک پاراگراف خیلی بلند است');
          else if (paras.length) add('read-para', 'طول پاراگراف', 'good', 'پاراگراف‌ها متعادل');
        }

        // Image
        if (hasImage) {
          if (imageHasAlt) add('img-alt', 'متن جایگزین تصویر', 'good', 'حداقل یک alt دارد');
          else add('img-alt', 'متن جایگزین تصویر', 'ok', 'تصویر هست ولی alt خالی است');
        } else {
          add('img-missing', 'تصویر شاخص', 'ok', 'تصویر شاخص توصیه می‌شود');
        }

        // URL
        if (url) {
          if (url.length > 90) add('url-long', 'طول URL', 'ok', 'URL کمی بلند است');
          else add('url-len', 'طول URL', 'good', 'مناسب');
          if (primary && url.toLowerCase().includes(primary.replace(/\s+/g, '-'))) add('url-kw', 'کلیدواژه در URL', 'good', 'وجود دارد');
        }

        const scoreMap = { good: 2, ok: 1, bad: 0 };
        const total = checks.reduce((s, c) => s + scoreMap[c.status], 0);
        const max = checks.length * 2 || 1;
        const score = Math.round((total / max) * 100);
        let traffic = 'red';
        if (score >= 75) traffic = 'green';
        else if (score >= 45) traffic = 'orange';
        return { score, traffic, checks, wordCount, kwCount: kws.length };
      };
