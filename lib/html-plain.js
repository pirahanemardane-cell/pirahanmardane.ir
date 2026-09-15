/** Lightweight HTML → plain text (no editor dependency) */
export function htmlToPlain(html) {
  if (!html) return '';
  try {
    if (typeof document !== 'undefined') {
      const d = document.createElement('div');
      d.innerHTML = String(html);
      return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
    }
  } catch (_) {}
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
