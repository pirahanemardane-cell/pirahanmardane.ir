import { withCatalogCache, cacheKey } from '../../../../lib/catalog-cache'
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 120;

const DEFAULTS = [
  { id: "cat-shirt", name: "پیراهن", slug: "shirt", parent_id: null, active: true, sort_order: 1 },
  { id: "cat-casual", name: "روزمره", slug: "casual", parent_id: null, active: true, sort_order: 2 },
  { id: "cat-formal", name: "رسمی", slug: "formal", parent_id: null, active: true, sort_order: 3 },
];

export async function GET(req) {
  const url = req?.url || "categories";
  const key = cacheKey(["catalog", "categories", url]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("catalog_categories")
        .select("id,name,slug,parent_id,active,sort_order")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[catalog/categories GET]", error);
        return NextResponse.json(
          { categories: DEFAULTS, error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      return NextResponse.json(
        { categories: data?.length ? data : DEFAULTS },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
      );
    });
  } catch (e) {
    console.error("[catalog/categories GET]", e);
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/categories", e);
    } catch (_) {}
    return NextResponse.json(
      { categories: DEFAULTS, error: String(e?.message || e) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.categories)
      ? body.categories
      : Array.isArray(body)
        ? body
        : null;
    if (!list) {
      return NextResponse.json({ error: "categories array required" }, { status: 400 });
    }

    const clean = list.map((c, i) => ({
      id: String(c.id || `cat-${Date.now()}-${i}`),
      name: String(c.name || "دسته").trim(),
      slug: String(c.slug || c.name || "cat")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 80),
      parent_id: c.parent_id || null,
      active: c.active !== false,
      sort_order: Number.isFinite(Number(c.sort_order)) ? Number(c.sort_order) : i,
      updated_at: new Date().toISOString(),
    }));

    const sb = createAdminClient();
    const { error: upErr } = await sb
      .from("catalog_categories")
      .upsert(clean, { onConflict: "id" });
    if (upErr) {
      console.error("[catalog/categories PUT]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const ids = clean.map((c) => c.id);
    const { data: existing } = await sb.from("catalog_categories").select("id");
    const toDelete = (existing || []).map((r) => r.id).filter((id) => !ids.includes(id));
    if (toDelete.length) {
      await sb.from("catalog_categories").delete().in("id", toDelete);
    }

    return NextResponse.json({ ok: true, categories: clean });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
