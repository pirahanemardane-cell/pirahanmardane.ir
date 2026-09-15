import { withCatalogCache, cacheKey } from "../../../../lib/catalog-cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  { id: "size-s", name: "S", slug: "s", active: true, sort_order: 1 },
  { id: "size-m", name: "M", slug: "m", active: true, sort_order: 2 },
  { id: "size-l", name: "L", slug: "l", active: true, sort_order: 3 },
  { id: "size-xl", name: "XL", slug: "xl", active: true, sort_order: 4 },
  { id: "size-2xl", name: "2XL", slug: "2xl", active: true, sort_order: 5 },
  { id: "size-3xl", name: "3XL", slug: "3xl", active: true, sort_order: 6 },
  { id: "size-4xl", name: "4XL", slug: "4xl", active: true, sort_order: 7 },
];

function mergeSizes(rows) {
  const map = new Map();
  for (const d of DEFAULTS) map.set(d.id, { ...d });
  for (const r of rows || []) {
    if (!r || !r.id) continue;
    if (r.active === false) {
      map.delete(r.id);
      continue;
    }
    map.set(r.id, {
      id: r.id,
      name: r.name || r.id,
      slug: r.slug || String(r.name || r.id).toLowerCase(),
      active: true,
      sort_order: Number.isFinite(r.sort_order) ? r.sort_order : 99,
    });
  }
  return Array.from(map.values()).sort((a, b) => (a.sort_order - b.sort_order) || String(a.name).localeCompare(String(b.name)));
}

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
        { sizes: mergeSizes(data) },
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
