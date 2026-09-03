'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * SimpleEditor
 * mode="restricted" → خریدار/فروشنده: بدون لینک و رسانه (جدول اختیاری)
 * mode="admin" → ادمین: لینک، HTML، عکس، ویدیو، جدول
 */

const SCRIPTISH = /^(SCRIPT|LINK)$/i;
const TABLE_TAGS = /^(TABLE|THEAD|TBODY|TFOOT|TR|TH|TD|COLGROUP|COL)$/i;
const MEDIA_TAGS = /^(IMG|VIDEO|IFRAME|OBJECT|EMBED|SOURCE)$/i;

function sanitizeHtml(html, { mode = 'restricted', allowTable = false } = {}) {
  if (typeof window === 'undefined') return String(html || '');
  const isAdmin = mode === 'admin';
  try {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const walk = (node) => {
      const children = [...node.childNodes];
      for (const child of children) {
        if (child.nodeType !== 1) continue;
        const tag = child.tagName;

        if (SCRIPTISH.test(tag)) {
          child.remove();
          continue;
        }

        if (!isAdmin) {
          if (/^A$/i.test(tag) || MEDIA_TAGS.test(tag) || (!allowTable && TABLE_TAGS.test(tag))) {
            const text = doc.createTextNode(child.textContent || '');
            child.replaceWith(text);
            continue;
          }
          [...child.attributes].forEach((attr) => {
            const n = attr.name.toLowerCase();
            if (n.startsWith('on') || n === 'href' || n === 'src' || n === 'xlink:href') {
              child.removeAttribute(attr.name);
            }
            // فقط style رنگ متن مجاز (برای ابزار رنگ ادیتور)
            if (n === 'style') {
              const st = (attr.value || '').toLowerCase();
              const m = st.match(/(?:^|;\s*)color\s*:\s*([^;]+)/);
              if (m) {
                const col = m[1].trim();
                if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(col) || /^rgb\(/i.test(col) || /^[a-z]+$/i.test(col)) {
                  child.setAttribute('style', `color: ${col}`);
                } else {
                  child.removeAttribute('style');
                }
              } else {
                child.removeAttribute('style');
              }
            }
          });
        } else {
          // ادمین: فقط handlerهای خطرناک حذف شوند
          [...child.attributes].forEach((attr) => {
            const n = attr.name.toLowerCase();
            if (n.startsWith('on')) child.removeAttribute(attr.name);
          });
          // iframe فقط دامنه امن
          if (/^IFRAME$/i.test(tag)) {
            const src = child.getAttribute('src') || '';
            const ok =
              /^(https?:)?\/\/([\w.-]+\.)?(aparat\.com|youtube\.com|www\.youtube\.com|youtu\.be|player\.aparat\.com)\//i.test(src) ||
              src.startsWith('https://www.aparat.com/') ||
              src.startsWith('https://www.youtube.com/') ||
              src.startsWith('https://youtube.com/');
            if (!ok && src) {
              // اجازه URLهای https عمومی برای embed ادمین
              if (!/^https:\/\//i.test(src)) child.remove();
            } else {
              child.setAttribute('allowfullscreen', 'true');
              child.setAttribute('loading', 'lazy');
            }
          }
        }
        walk(child);
      }
    };
    walk(doc.body);
    let out = doc.body.innerHTML;
    if (!isAdmin) {
      out = out.replace(/https?:\/\/[^\s<]+/gi, '[لینک حذف شد]');
      out = out.replace(/www\.[^\s<]+/gi, '[لینک حذف شد]');
    }
    return out;
  } catch {
    return String(html || '');
  }
}

function htmlToPlain(html) {
  if (typeof window === 'undefined') return String(html || '').replace(/<[^>]+>/g, '');
  const d = document.createElement('div');
  d.innerHTML = String(html || '');
  return (d.textContent || '').trim();
}

export default function SimpleEditor({
  value = '',
  defaultValue = '',
  onChange,
  placeholder = 'متن خود را بنویسید…',
  appearance = 'comment',
  maxLength = 2000,
  className = '',
  dir = 'rtl',
  allowTable = false,
  mode = 'restricted', // 'restricted' | 'admin'
}) {
  const isAdmin = mode === 'admin';
  const canTable = allowTable || isAdmin;
  const ref = useRef(null);
  const lastValue = useRef('');
  const [htmlMode, setHtmlMode] = useState(false);
  const [editorDialog, setEditorDialog] = useState(null);
  // { title, defaultValue, resolve }
  const [htmlSource, setHtmlSource] = useState('');
  const initial = value != null && value !== '' ? value : defaultValue;

  useEffect(() => {
    const el = ref.current;
    if (!el || htmlMode) return;
    const next = value != null ? value : '';
    if (next !== lastValue.current && el.innerHTML !== next) {
      el.innerHTML = next || '';
      lastValue.current = next || '';
    }
  }, [value, htmlMode]);

  useEffect(() => {
    const el = ref.current;
    if (!el || htmlMode) return;
    if (!el.innerHTML && initial) {
      el.innerHTML = sanitizeHtml(initial, { mode, allowTable: canTable });
      lastValue.current = el.innerHTML;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = useCallback(
    (raw) => {
      const clean = sanitizeHtml(raw != null ? raw : ref.current?.innerHTML || '', {
        mode,
        allowTable: canTable,
      });
      if (ref.current && !htmlMode && clean !== ref.current.innerHTML) {
        ref.current.innerHTML = clean;
      }
      lastValue.current = clean;
      const plain = htmlToPlain(clean);
      onChange && onChange(clean, plain);
    },
    [onChange, mode, canTable, htmlMode]
  );

  const run = (cmd, val = null) => {
    try {
      ref.current?.focus();
      document.execCommand(cmd, false, val);
      emit();
    } catch (_) {}
  };

  const insertTable = () => {
    if (!canTable) return;
    try {
      ref.current?.focus();
      document.execCommand(
        'insertHTML',
        false,
        '<table class="se-table"><thead><tr><th>ستون ۱</th><th>ستون ۲</th><th>ستون ۳</th></tr></thead><tbody><tr><td>—</td><td>—</td><td>—</td></tr><tr><td>—</td><td>—</td><td>—</td></tr></tbody></table><p><br></p>'
      );
      emit();
    } catch (_) {}
  };

  const insertLink = () => {
    if (!isAdmin) return;
    setEditorDialog({
      title: 'آدرس لینک (https://…)',
      defaultValue: 'https://',
      resolve: (url) => {
        if (!url) return;
        if (!/^https?:\/\//i.test(url.trim())) {
          setEditorDialog({
            title: 'خطا',
            message: 'فقط لینک با http/https مجاز است',
            mode: 'alert',
            resolve: () => {},
          });
          return;
        }
        run('createLink', url.trim());
      },
    });
  };

  const insertImage = () => {
    if (!isAdmin) return;
    setEditorDialog({
      title: 'آدرس تصویر (https://… یا data:image)',
      defaultValue: '',
      resolve: (url) => {
        if (!url) return;
        if (!/^(https?:\/\/|data:image\/)/i.test(url.trim())) {
          setEditorDialog({ title: 'خطا', message: 'آدرس تصویر معتبر نیست', mode: 'alert', resolve: () => {} });
          return;
        }
        try {
          ref.current?.focus();
          document.execCommand(
            'insertHTML',
            false,
            `<img src="${url.trim().replace(/"/g, '')}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`
          );
          emit();
        } catch (_) {}
      },
    });
  };

    const insertVideo = () => {
    if (!isAdmin) return;
    setEditorDialog({
      title: 'لینک ویدیو آپارات / یوتیوب یا embed URL',
      defaultValue: '',
      resolve: (urlRaw) => {
        const url = (urlRaw || '').trim();
        if (!url) return;
        let src = url;
        const ap = url.match(/aparat\.com\/v\/([\w-]+)/i);
        if (ap) src = `https://www.aparat.com/video/video/embed/videohash/${ap[1]}/vt/frame`;
        const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i);
        if (yt) src = `https://www.youtube.com/embed/${yt[1]}`;
        if (!/^https:\/\//i.test(src)) {
          setEditorDialog({ title: 'خطا', message: 'آدرس ویدیو معتبر نیست', mode: 'alert', resolve: () => {} });
          return;
        }
        try {
          ref.current?.focus();
          document.execCommand(
            'insertHTML',
            false,
            `<div class="se-video"><iframe src="${src.replace(/"/g, '')}" title="video" allowfullscreen loading="lazy" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px;"></iframe></div><p><br></p>`
          );
          emit();
        } catch (_) {}
      },
    });
  };

const toggleHtmlMode = () => {
    if (!isAdmin) return;
    if (!htmlMode) {
      const current = ref.current?.innerHTML || value || '';
      setHtmlSource(current);
      setHtmlMode(true);
    } else {
      const clean = sanitizeHtml(htmlSource, { mode: 'admin', allowTable: true });
      setHtmlMode(false);
      requestAnimationFrame(() => {
        if (ref.current) ref.current.innerHTML = clean;
        emit(clean);
      });
    }
  };

  const onPaste = (e) => {
    if (htmlMode) return;
    if (isAdmin) {
      // اجازه HTML از کلیپ‌بورد با sanitize ادمین
      const html = (e.clipboardData || window.clipboardData).getData('text/html');
      if (html) {
        e.preventDefault();
        const clean = sanitizeHtml(html, { mode: 'admin', allowTable: true });
        document.execCommand('insertHTML', false, clean);
        emit();
        return;
      }
      return; // متن ساده پیش‌فرض مرورگر
    }
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
    const safe = text
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/www\.\S+/gi, '')
      .replace(/<[^>]*>/g, '');
    document.execCommand('insertText', false, safe);
    emit();
  };

  const minH =
    appearance === 'full'
      ? 'min-h-[min(52vh,420px)]'
      : appearance === 'comment'
        ? 'min-h-[180px]'
        : 'min-h-[160px]';
  const maxH = appearance === 'full' ? 'max-h-[min(65vh,560px)]' : 'max-h-[min(45vh,360px)]';

  const applyHeading = (tag) => {
    // formatBlock در مرورگرها گاهی به <h2> و گاهی h2 نیاز دارد
    try {
      ref.current?.focus();
      const ok = document.execCommand('formatBlock', false, tag);
      if (!ok) document.execCommand('formatBlock', false, `<${tag}>`);
      emit();
    } catch (_) {
      run('formatBlock', tag);
    }
  };

  const applyColor = (color) => {
    try {
      ref.current?.focus();
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, color);
      emit();
    } catch (_) {}
  };

  const TEXT_COLORS = [
    { id: 'c-default', label: 'پیش‌فرض', value: '#111827' },
    { id: 'c-gray', label: 'خاکستری', value: '#6B7280' },
    { id: 'c-red', label: 'قرمز', value: '#DC2626' },
    { id: 'c-orange', label: 'نارنجی', value: '#EA580C' },
    { id: 'c-amber', label: 'کهربایی', value: '#D97706' },
    { id: 'c-green', label: 'سبز', value: '#059669' },
    { id: 'c-blue', label: 'آبی', value: '#2563EB' },
    { id: 'c-indigo', label: 'نیلی', value: '#4F46E5' },
    { id: 'c-purple', label: 'بنفش', value: '#7C3AED' },
    { id: 'c-pink', label: 'صورتی', value: '#DB2777' },
    { id: 'c-white', label: 'سفید', value: '#FFFFFF' },
  ];

  const tools = [
    { id: 'bold', label: 'بولد', cmd: () => run('bold') },
    { id: 'italic', label: 'کج', cmd: () => run('italic') },
    { id: 'underline', label: 'زیرخط', cmd: () => run('underline') },
    { id: 'ul', label: 'فهرست', cmd: () => run('insertUnorderedList') },
    { id: 'ol', label: 'شماره', cmd: () => run('insertOrderedList') },
    { id: 'quote', label: 'نقل', cmd: () => run('formatBlock', 'blockquote') },
  ];
  if (canTable) tools.push({ id: 'table', label: 'جدول', cmd: insertTable });
  if (isAdmin) {
    tools.push(
      { id: 'link', label: 'لینک', cmd: insertLink },
      { id: 'img', label: 'عکس', cmd: insertImage },
      { id: 'video', label: 'ویدیو', cmd: insertVideo },
      { id: 'html', label: htmlMode ? 'ویژه' : 'HTML', cmd: toggleHtmlMode }
    );
  }

  return (
    <>

      {editorDialog && (
        <div className="site-modal-root" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => { const r = editorDialog.resolve; setEditorDialog(null); r?.(null); }} />
          <div className="site-modal-panel bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/15 p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white text-right">{editorDialog.title}</h3>
            {editorDialog.message ? (
              <p className="text-sm text-neutral-600 dark:text-white/80 text-right">{editorDialog.message}</p>
            ) : null}
            {editorDialog.mode !== 'alert' && (
              <input
                id="se-dialog-input"
                autoFocus
                defaultValue={editorDialog.defaultValue || ''}
                dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-white/20 bg-transparent text-sm text-left text-neutral-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = e.currentTarget.value;
                    const r = editorDialog.resolve;
                    setEditorDialog(null);
                    r?.(v);
                  }
                  if (e.key === 'Escape') {
                    const r = editorDialog.resolve;
                    setEditorDialog(null);
                    r?.(null);
                  }
                }}
              />
            )}
            <div className="flex gap-2 justify-start">
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium"
                onClick={() => {
                  if (editorDialog.mode === 'alert') {
                    const r = editorDialog.resolve;
                    setEditorDialog(null);
                    r?.(null);
                    return;
                  }
                  const el = document.getElementById('se-dialog-input');
                  const v = el?.value || '';
                  const r = editorDialog.resolve;
                  setEditorDialog(null);
                  r?.(v);
                }}
              >
                تأیید
              </button>
              {editorDialog.mode !== 'alert' && (
                <button
                  type="button"
                  className="px-5 py-2 rounded-full border border-neutral-200 dark:border-white/30 text-sm"
                  onClick={() => {
                    const r = editorDialog.resolve;
                    setEditorDialog(null);
                    r?.(null);
                  }}
                >
                  انصراف
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    <div
      className={`simple-editor rounded-xl border border-primary-200 dark:border-white/20 bg-white dark:bg-primary-950 overflow-hidden ${className}`}
      data-appearance={appearance}
      data-mode={mode}
    >
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-primary-100 dark:border-white/10 bg-primary-50/80 dark:bg-primary-900/50">
        {/* سلسله‌مراتب هدینگ */}
        <label className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-white/80">
          <span className="sr-only">هدینگ</span>
          <select
            aria-label="سطح عنوان"
            defaultValue=""
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              applyHeading(v);
              e.target.value = '';
            }}
            className="px-2 py-1 rounded-lg text-xs font-medium bg-white dark:bg-primary-800 border border-primary-200 dark:border-white/20 text-primary-800 dark:text-white outline-none cursor-pointer max-w-[7.5rem]"
          >
            <option value="" disabled>
              هدینگ…
            </option>
            <option value="p">پاراگراف</option>
            <option value="h1">H1 · عنوان اصلی</option>
            <option value="h2">H2 · عنوان</option>
            <option value="h3">H3 · زیرعنوان</option>
            <option value="h4">H4 · کوچک</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
          </select>
        </label>

        {/* بولد و سایر */}
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onMouseDown={(e) => {
              e.preventDefault();
              t.cmd();
            }}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              t.id === 'bold'
                ? 'font-bold text-primary-900 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800'
                : t.id === 'html' && htmlMode
                ? 'bg-[#4CCD99] text-white'
                : 'text-primary-700 dark:text-white/90 hover:bg-primary-100 dark:hover:bg-primary-800'
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* پالت رنگ متن */}
        <div className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-lg border border-primary-200 dark:border-white/15 bg-white/80 dark:bg-primary-800/80" title="رنگ متن">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              aria-label={`رنگ ${c.label}`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyColor(c.value);
              }}
              className="color-swatch se-text-color-swatch w-4 h-4 rounded-full border border-black/15 dark:border-white/50 hover:scale-110 transition shrink-0"
              style={{ ["--swatch-color"]: c.value, backgroundColor: c.value }}
            />
          ))}
        </div>

        <span className="mr-auto text-xs text-primary-400 dark:text-white/40 self-center px-1">
          {isAdmin ? 'ادمین · لینک / HTML / رسانه' : 'بدون لینک و رسانه'}
        </span>
      </div>
      {htmlMode ? (
        <textarea
          value={htmlSource}
          onChange={(e) => {
            setHtmlSource(e.target.value);
            emit(e.target.value);
          }}
          dir="ltr"
          spellCheck={false}
          className={`w-full ${minH} ${maxH} overflow-y-auto px-3 py-3 text-xs text-right text-primary-900 dark:text-white bg-primary-50/50 dark:bg-black/30 outline-none resize-y leading-6`}
          placeholder="HTML…"
        />
      ) : (
        <div
          ref={ref}
          className={`simple-editor-surface px-3 py-3 text-sm text-primary-900 dark:text-white outline-none ${minH} ${maxH} overflow-y-auto leading-7`}
          contentEditable
          suppressContentEditableWarning
          dir={dir}
          data-placeholder={placeholder}
          onInput={() => emit()}
          onBlur={() => emit()}
          onPaste={onPaste}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
        />
      )}
    </div>
    </>
  );
}

export { sanitizeHtml, htmlToPlain };
