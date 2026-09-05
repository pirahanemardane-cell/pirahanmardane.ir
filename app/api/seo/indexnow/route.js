import { NextResponse } from 'next/server';

/**
 * پروکسی IndexNow سمت سرور (P0)
 * body: { host, key, keyLocation?, urlList: string[] }
 */
export async function POST(request) {
  try {
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
