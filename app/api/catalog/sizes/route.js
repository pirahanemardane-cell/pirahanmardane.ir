import { withCatalogCache, cacheKey } from "../../../../lib/catalog-cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  { id: "size-s", name: "S", slug: "s", active: true, sort_order: 1 },
  { id: "size-m", name: "M", slug: "m", active: true, sort_order: 2 },
  { id: "size-l", name: "L", slug: "l", active: true, sort_order: 3 },
  { id: "size-xl", name: "XL", slug: "xl", active: true, sort_order: 4 },
];

export async function GET(req) {
  const key = cacheKey(["catalog", "sizes", req?.url || "sizes"]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("catalog_sizes")
        .select("id,name,slug,active,sort_order")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[catalog/sizes GET]", error);
        return NextResponse.json(
          { sizes: DEFAULTS, error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      return NextResponse.json(
        { sizes: data?.length ? data : DEFAULTS },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
      );
    });
  } catch (e) {
    console.error("[catalog/sizes GET]", e);
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/sizes", e);
    } catch (_) {}
    return NextResponse.json(
      { sizes: DEFAULTS, error: String(e?.message || e) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.sizes)
      ? body.sizes
      : Array.isArray(body)
        ? body
        : null;
    if (!list) {
      return NextResponse.json({ error: "sizes array required" }, { status: 400 });
    }

    const clean = list.map((s, i) => ({
      id: String(s.id || `size-${Date.now()}-${i}`),
      name: String(s.name || "سایز").trim(),
      slug: String(s.slug || s.name || "size")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 40),
      active: s.active !== false,
      sort_order: Number.isFinite(Number(s.sort_order)) ? Number(s.sort_order) : i,
      updated_at: new Date().toISOString(),
    }));

    const sb = createAdminClient();
    const { error: upErr } = await sb
      .from("catalog_sizes")
      .upsert(clean, { onConflict: "id" });
    if (upErr) {
      console.error("[catalog/sizes PUT]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const ids = clean.map((s) => s.id);
    const { data: existing } = await sb.from("catalog_sizes").select("id");
    const toDelete = (existing || []).map((r) => r.id).filter((id) => !ids.includes(id));
    if (toDelete.length) {
      await sb.from("catalog_sizes").delete().in("id", toDelete);
    }

    return NextResponse.json({ ok: true, sizes: clean });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
