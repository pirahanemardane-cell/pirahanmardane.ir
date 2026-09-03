import { withCatalogCache, cacheKey } from "../../../../lib/catalog-cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  { id: "tag-new", name: "جدید", slug: "new", active: true, sort_order: 1 },
  { id: "tag-sale", name: "حراج", slug: "sale", active: true, sort_order: 2 },
];

export async function GET(req) {
  const key = cacheKey(["catalog", "tags", req?.url || "tags"]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("catalog_tags")
        .select("id,name,slug,active,sort_order")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[catalog/tags GET]", error);
        return NextResponse.json(
          { tags: DEFAULTS, error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      return NextResponse.json(
        { tags: data?.length ? data : DEFAULTS },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
      );
    });
  } catch (e) {
    console.error("[catalog/tags GET]", e);
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/tags", e);
    } catch (_) {}
    return NextResponse.json(
      { tags: DEFAULTS, error: String(e?.message || e) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.tags)
      ? body.tags
      : Array.isArray(body)
        ? body
        : null;
    if (!list) {
      return NextResponse.json({ error: "tags array required" }, { status: 400 });
    }

    const clean = list.map((t, i) => ({
      id: String(t.id || `tag-${Date.now()}-${i}`),
      name: String(t.name || "برچسب").trim(),
      slug: String(t.slug || t.name || "tag")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 80),
      active: t.active !== false,
      sort_order: Number.isFinite(Number(t.sort_order)) ? Number(t.sort_order) : i,
      updated_at: new Date().toISOString(),
    }));

    const sb = createAdminClient();
    const { error: upErr } = await sb
      .from("catalog_tags")
      .upsert(clean, { onConflict: "id" });
    if (upErr) {
      console.error("[catalog/tags PUT]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const ids = clean.map((t) => t.id);
    const { data: existing } = await sb.from("catalog_tags").select("id");
    const toDelete = (existing || []).map((r) => r.id).filter((id) => !ids.includes(id));
    if (toDelete.length) {
      await sb.from("catalog_tags").delete().in("id", toDelete);
    }

    return NextResponse.json({ ok: true, tags: clean });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
