import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/api/admin-guard';

/**
 * پروکسی IndexNow سمت سرور
 * فقط ادمین لاگین‌شده یا هدر Authorization: Bearer CRON_SECRET
 * body: { host, key, keyLocation?, urlList: string[] }
 */
function authorizedCron(request) {
  const secret = process.env.CRON_SECRET || process.env.SMS_CRON_SECRET || '';
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  if (auth === `Bearer ${secret}`) return true;
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('secret') === secret) return true;
  } catch (_) {}
  return false;
}

export async function POST(request) {
  try {
    if (!authorizedCron(request)) {
      const gate = await requireAdmin();
      if (gate.error) return gate.error;
    }
    const body = await request.json();
    const host = String(body.host || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const key = String(body.key || process.env.INDEXNOW_KEY || '').trim();
    const urlList = Array.isArray(body.urlList) ? body.urlList.filter(Boolean).slice(0, 100) : [];

    if (!host || !key || !urlList.length) {
      return NextResponse.json(
        { ok: false, error: 'host، key و urlList الزامی است' },
        { status: 400 }
      );
    }

    const payload = {
      host,
      key,
      keyLocation: body.keyLocation || `https://${host}/${key}.txt`,
      urlList,
    };

    // در dev بدون کلید واقعی، فقط validate می‌کنیم
    if (process.env.INDEXNOW_DRY_RUN === '1' || !process.env.INDEXNOW_KEY) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        payload,
        message: 'Dry-run: برای ارسال واقعی INDEXNOW_KEY را در env بگذارید',
      });
    }

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const text = await res.text().catch(() => '');
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      body: text.slice(0, 500),
    });
  } catch (e) { try { await logCritical('app/api/seo/indexnow/route.js', e) } catch (_lc) {}
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
