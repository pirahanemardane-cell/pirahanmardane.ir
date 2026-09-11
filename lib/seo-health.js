/** runSeoHealthCheck — pure */
export function runSeoHealthCheck(seoCfgObj = {}, products = [], redirects = []) {
  const s = seoCfgObj || {};
  const issues = [];
  if (!s.canonicalBase) issues.push('آدرس canonical پایه خالی است');
  if (!s.siteTitle) issues.push('عنوان سایت خالی است');
  if (!s.metaDescription || String(s.metaDescription).length < 50) issues.push('توضیحات متای سراسری کوتاه یا خالی است');
  if (!s.organizationName) issues.push('نام سازمان برای Schema خالی است');
  const pending = (products || []).filter(p => p && (p.status === 'pending' || p.status === 'awaiting'));
  if (pending.length) issues.push(`${pending.length} محصول در انتظار تأیید (نباید در sitemap ایندکس شوند)`);
  const redirs = redirects || [];
  const dangling = redirs.filter(r => r.type !== '410' && !r.to);
  if (dangling.length) issues.push(`${dangling.length} ریدایرکت بدون مقصد`);
  return { ok: issues.length === 0, issues };
}
