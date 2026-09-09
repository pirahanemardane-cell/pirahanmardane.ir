import { withCatalogCache, cacheKey } from '../../../../lib/catalog-cache'
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 120;

/** پرفروش‌ترین برندهای کاتالوگ را روی صفحه اصلی می‌آورد؛ برندهایی که ادمین opt-out کرده دست نمی‌خورند */
async function promoteTopBrands(sb) {
  try {
    const { data: brands } = await sb
      .from('catalog_brands')
      .select('id,name,active,show_on_home,home_opt_out,featured_top')
      .eq('active', true);
    if (!brands || !brands.length) return;

    const { data: products } = await sb
      .from('products')
      .select('brand_id,brand_name,brand,sold_count,status,featured_top')
      .eq('status', 'active')
      .limit(500);
    if (!products || !products.length) return;

    const byId = new Map();
    const byName = new Map();
    for (const b of brands) {
      byId.set(String(b.id).toLowerCase(), b);
      byName.set(String(b.name || '').trim().toLowerCase(), b);
    }

    const scores = new Map();
    for (const p of products) {
      const bid = String(p.brand_id || '').trim();
      const bname = String(p.brand_name || p.brand || '').trim();
      if (!bid && !bname) continue;
      const hit = (bid && byId.get(bid.toLowerCase())) || (bname && byName.get(bname.toLowerCase()));
      if (!hit) continue;
      if (hit.home_opt_out === true) continue; // ادمین عمداً برداشته
      const k = String(hit.id);
      const sold = Number(p.sold_count || 0);
      scores.set(k, (scores.get(k) || 0) + (sold > 0 ? sold : 1));
    }

    const topIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);

    for (const id of topIds) {
      const b = brands.find((x) => String(x.id) === id);
      if (!b || b.show_on_home === true || b.home_opt_out === true) continue;
      await sb.from('catalog_brands').update({ show_on_home: true }).eq('id', id);
    }
  } catch (e) {
    console.error('[brands promoteTopBrands]', e);
  }
}



const DEFAULTS = [
  { id: "brand-generic", name: "عمومی", slug: "generic", active: true, sort_order: 1, logo_url: null },
];

export async function GET(req) {
  const url = req?.url || "brands";
  const key = cacheKey(["catalog", "brands", url]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      // auto-feature پرفروش‌ها (خطا نادیده)
      try { await promoteTopBrands(sb); } catch (_) {}

      const { data, error } = await sb
        .from("catalog_brands")
        .select("id,name,slug,active,sort_order,logo_url,show_on_home,home_opt_out")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[catalog/brands GET]", error);
        return NextResponse.json(
          { brands: DEFAULTS, error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      // بدون برند واقعی → آرایه خالی (نه DEFAULT «عمومی»)
      return NextResponse.json(
        { brands: Array.isArray(data) ? data : [] },
        { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } }
      );
    });
  } catch (e) {
    console.error("[catalog/brands GET]", e);
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/brands", e);
    } catch (_) {}
    return NextResponse.json(
      { brands: DEFAULTS, error: String(e?.message || e) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.brands)
      ? body.brands
      : Array.isArray(body)
        ? body
        : null;
    if (!list) {
      return NextResponse.json({ error: "brands array required" }, { status: 400 });
    }

    const clean = list.map((b, i) => ({
      id: String(b.id || `brand-${Date.now()}-${i}`),
      name: String(b.name || "برند").trim(),
      slug: String(b.slug || b.name || "brand")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 80),
      active: b.active !== false,
      sort_order: Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : i,
      logo_url: b.logo_url || b.logoUrl || b.image || null,
      show_on_home: !!(b.show_on_home ?? b.showOnHome),
      home_opt_out: !!(b.home_opt_out ?? b.homeOptOut),
      updated_at: new Date().toISOString(),
    }));

    const sb = createAdminClient();
    let upErr = null;
    {
      const r = await sb.from("catalog_brands").upsert(clean, { onConflict: "id" });
      upErr = r.error;
    }
    if (upErr) {
      const msg = String(upErr.message || '').toLowerCase();
      if (msg.includes('show_on_home') || msg.includes('column')) {
        const minimal = clean.map(({ show_on_home, ...rest }) => rest);
        const r2 = await sb.from("catalog_brands").upsert(minimal, { onConflict: "id" });
        upErr = r2.error;
      }
    }
    if (upErr) {
      console.error("[catalog/brands PUT]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const ids = clean.map((b) => b.id);
    const { data: existing } = await sb.from("catalog_brands").select("id");
    const toDelete = (existing || []).map((r) => r.id).filter((id) => !ids.includes(id));
    if (toDelete.length) {
      await sb.from("catalog_brands").delete().in("id", toDelete);
    }

    try {
      const { invalidateCatalogCache } = await import('@/lib/catalog-cache');
      if (typeof invalidateCatalogCache === 'function') invalidateCatalogCache();
    } catch (_) {}

    return NextResponse.json({ ok: true, brands: clean }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
