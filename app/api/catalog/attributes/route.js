import { withCatalogCache, cacheKey } from "../../../../lib/catalog-cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  {
    id: "attr-fabric",
    name: "جنس پارچه",
    slug: "fabric",
    active: true,
    sort_order: 1,
    options: ["پنبه", "کتان", "پلی‌استر"],
    category_names: [],
  },
];

function normalizeRow(a, i = 0) {
  const opts = Array.isArray(a.options)
    ? a.options
    : Array.isArray(a.values)
      ? a.values
      : typeof a.options === "string"
        ? a.options.split(/[,،]/).map((x) => x.trim()).filter(Boolean)
        : [];
  const cats = Array.isArray(a.category_names)
    ? a.category_names
    : Array.isArray(a.categoryNames)
      ? a.categoryNames
      : Array.isArray(a.categories)
        ? a.categories
        : [];
  return {
    id: String(a.id || `attr-${Date.now()}-${i}`),
    name: String(a.name || "ویژگی").trim(),
    slug: String(a.slug || a.name || "attr")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80),
    active: a.active !== false,
    sort_order: Number.isFinite(Number(a.sort_order != null ? a.sort_order : a.sortOrder))
      ? Number(a.sort_order != null ? a.sort_order : a.sortOrder)
      : i,
    options: opts.map((x) => String(x).trim()).filter(Boolean),
    category_names: cats.map((x) => String(x).trim()).filter(Boolean),
    updated_at: new Date().toISOString(),
  };
}

function toClient(row) {
  return {
    ...row,
    categoryNames: row.category_names || row.categoryNames || [],
    values: row.options || [],
  };
}

export async function GET(req) {
  const key = cacheKey(["catalog", "attributes", req?.url || "attributes"]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("catalog_attributes")
        .select("id,name,slug,active,sort_order,options,category_names")
        .order("sort_order")
        .order("name");
      if (error) {
        console.error("[catalog/attributes GET]", error);
        return NextResponse.json(
          { attributes: DEFAULTS.map(toClient), error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      const list = (data?.length ? data : DEFAULTS).map(toClient);
      return NextResponse.json(
        { attributes: list },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
      );
    });
  } catch (e) {
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/attributes", e);
    } catch (_) {}
    return NextResponse.json(
      { attributes: DEFAULTS.map(toClient), error: String(e?.message || e) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.attributes)
      ? body.attributes
      : Array.isArray(body)
        ? body
        : null;
    if (!list) {
      return NextResponse.json({ error: "attributes array required" }, { status: 400 });
    }

    const clean = list.map((a, i) => normalizeRow(a, i));
    const sb = createAdminClient();
    const { error: upErr } = await sb
      .from("catalog_attributes")
      .upsert(clean, { onConflict: "id" });
    if (upErr) {
      console.error("[catalog/attributes PUT]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const ids = clean.map((a) => a.id);
    const { data: existing } = await sb.from("catalog_attributes").select("id");
    const toDelete = (existing || []).map((r) => r.id).filter((id) => !ids.includes(id));
    if (toDelete.length) {
      await sb.from("catalog_attributes").delete().in("id", toDelete);
    }

    return NextResponse.json({ ok: true, attributes: clean.map(toClient) });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
