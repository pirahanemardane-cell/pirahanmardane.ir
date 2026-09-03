import { withCatalogCache, cacheKey } from '../../../../lib/catalog-cache'
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 120;

const DEFAULTS = [
  { id: "brand-generic", name: "عمومی", slug: "generic", active: true, sort_order: 1, logo_url: null },
];

export async function GET(req) {
  const url = req?.url || "brands";
  const key = cacheKey(["catalog", "brands", url]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("catalog_brands")
        .select("id,name,slug,active,sort_order,logo_url")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[catalog/brands GET]", error);
        return NextResponse.json(
          { brands: DEFAULTS, error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      return NextResponse.json(
        { brands: data?.length ? data : DEFAULTS },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
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
      updated_at: new Date().toISOString(),
    }));

    const sb = createAdminClient();
    const { error: upErr } = await sb
      .from("catalog_brands")
      .upsert(clean, { onConflict: "id" });
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

    return NextResponse.json({ ok: true, brands: clean });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
