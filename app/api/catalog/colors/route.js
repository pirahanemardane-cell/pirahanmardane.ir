import { withCatalogCache, cacheKey } from "../../../../lib/catalog-cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  { id: "col-black", name: "مشکی", hex: "#111111", active: true },
  { id: "col-white", name: "سفید", hex: "#FFFFFF", active: true },
  { id: "col-navy", name: "سرمه‌ای", hex: "#1B2A4A", active: true },
  { id: "col-gray", name: "خاکستری", hex: "#6B7280", active: true },
  { id: "col-beige", name: "کرم", hex: "#D4C4A8", active: true },
  { id: "col-brown", name: "قهوه‌ای", hex: "#6B3F2A", active: true },
  { id: "col-blue", name: "آبی", hex: "#2563EB", active: true },
  { id: "col-red", name: "قرمز", hex: "#DC2626", active: true },
];

export async function GET(req) {
  const key = cacheKey(["catalog", "colors", req?.url || "colors"]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from("catalog_colors")
        .select("id,name,hex,active")
        .order("name");
      if (error) {
        console.error("[catalog/colors GET]", error);
        return NextResponse.json(
          { colors: DEFAULTS, error: error.message },
          { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
        );
      }
      return NextResponse.json(
        { colors: data?.length ? data : DEFAULTS },
        { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
      );
    });
  } catch (e) {
    console.error("[catalog/colors GET]", e);
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/colors", e);
    } catch (_) {}
    return NextResponse.json(
      { colors: DEFAULTS, error: String(e?.message || e) },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.colors)
      ? body.colors
      : Array.isArray(body)
        ? body
        : null;
    if (!list) {
      return NextResponse.json({ error: "colors array required" }, { status: 400 });
    }
    const clean = list.map((c, i) => ({
      id: String(c.id || `col-${Date.now()}-${i}`),
      name: String(c.name || "رنگ").trim(),
      hex: String(c.hex || "#888888").trim(),
      active: c.active !== false,
      updated_at: new Date().toISOString(),
    }));

    const sb = createAdminClient();
    const { error: upErr } = await sb
      .from("catalog_colors")
      .upsert(clean, { onConflict: "id" });
    if (upErr) {
      console.error("[catalog/colors PUT]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const ids = clean.map((c) => c.id);
    const { data: existing } = await sb.from("catalog_colors").select("id");
    const toDelete = (existing || []).map((r) => r.id).filter((id) => !ids.includes(id));
    if (toDelete.length) {
      await sb.from("catalog_colors").delete().in("id", toDelete);
    }

    return NextResponse.json({ ok: true, colors: clean });
  } catch (e) {
    console.error("[catalog/colors PUT]", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
