import { withCatalogCache, cacheKey } from '../../../../lib/catalog-cache'
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export const revalidate = 60; // catalog public cache (seconds)

function isUuid(v) {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
  );
}

function isUsableImg(u) {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!s || s === "/logo.webp") return false;
  if (/^https?:\/\/?$/i.test(s)) return false;
  if (/^https?:\/\//i.test(s)) return s.length > 12;
  if (s.startsWith("/") && s.length > 3) return true;
  if (s.startsWith("data:image/")) return true;
  return false;
}

function rowToUi(row) {
  if (!row) return null;
  const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
  const rawImages =
    Array.isArray(payload.images) && payload.images.length
      ? payload.images
      : Array.isArray(row.images)
        ? row.images
        : row.cover_image
          ? [row.cover_image]
          : [];
  const images = rawImages.filter(isUsableImg);
  const cover =
    (isUsableImg(row.cover_image) && row.cover_image) ||
    images[0] ||
    null;
  if (cover && !images.length) images.push(cover);

  // اصلاح colors[].image ناقص (مثلاً "https:") تا کارت فروشگاه عکس را از دست ندهد
  let colors = Array.isArray(payload.colors) ? payload.colors.map((c) => ({ ...(c || {}) })) : [];
  if (colors.length) {
    colors = colors.map((c, i) => ({
      ...c,
      image: isUsableImg(c.image) ? String(c.image).trim() : (images[i] || cover || null),
    }));
  }

  const sellerJoin = row.sellers || row.seller || null;
  const sellerName =
    (sellerJoin && (sellerJoin.shop_name || sellerJoin.name)) ||
    payload.seller?.name ||
    payload.sellerName ||
    null;
  const sellerId = row.seller_id || payload.sellerId || sellerJoin?.id || null;
  return {
    ...payload,
    id: row.id,
    name: row.name || row.title || payload.name || "",
    title: row.title || row.name || payload.title,
    slug: row.slug || payload.slug,
    price: row.base_price ?? payload.price ?? 0,
    base_price: row.base_price,
    cover_image: cover,
    image: cover,
    status: row.status || payload.status || "pending",
    contentStatus: payload.contentStatus || row.status,
    productCode: row.product_code || payload.productCode,
    images,
    colors: colors.length ? colors : payload.colors,
    featuredImageIndex: payload.featuredImageIndex || 0,
    sellerId,
    seller_id: sellerId,
    seller_name: sellerName,
    seller: sellerId
      ? { id: sellerId, name: sellerName || "فروشگاه" }
      : payload.seller && typeof payload.seller === "object"
        ? { id: payload.seller.id || "own", name: payload.seller.name || sellerName || "فروشگاه" }
        : { id: "own", name: sellerName || "فروشگاه" },
    category_id: row.category_id,
    category_name: row.categories?.name || payload.category || null,
    brand_id: row.brand_id,
    description: row.description || payload.desc || payload.description,
    scheduled_publish_at: row.scheduled_publish_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function parsePrice(p) {
  if (typeof p.base_price === "number" && Number.isFinite(p.base_price)) return Math.round(p.base_price);
  if (typeof p.price === "number" && Number.isFinite(p.price)) return Math.round(p.price);
  const raw = String(p.priceText || p.price || "0").replace(/[^\d]/g, "");
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}


const catalogCacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};
const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId") || searchParams.get("seller_id");
  const status = searchParams.get("status");
  const key = cacheKey(["catalog", "products", sellerId || "", status || "active", req.url]);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      let q = sb
        .from("products")
        .select("*, sellers(id, shop_name), categories(id, name)")
        .order("updated_at", { ascending: false })
        .limit(500);
      if (sellerId && isUuid(sellerId)) q = q.eq("seller_id", sellerId);
      if (status) {
        q = q.eq("status", status);
      } else {
        q = q.eq("status", "active");
      }
      const { data, error } = await q;
      if (error) {
        console.error("[catalog/products GET]", error);
        let q2 = sb.from("products").select("*").order("updated_at", { ascending: false }).limit(500);
        if (sellerId && isUuid(sellerId)) q2 = q2.eq("seller_id", sellerId);
        if (status) q2 = q2.eq("status", status);
        else q2 = q2.eq("status", "active");
        const r2 = await q2;
        if (r2.error) {
          return NextResponse.json(
            { ok: false, products: [], error: error.message },
            { headers: { "Cache-Control": "no-store" } }
          );
        }
        return NextResponse.json(
          { ok: true, products: (r2.data || []).map(rowToUi).filter(Boolean) },
          { headers: catalogCacheHeaders }
        );
      }
      return NextResponse.json(
        { ok: true, products: (data || []).map(rowToUi).filter(Boolean) },
        { headers: catalogCacheHeaders }
      );
    });
  } catch (e) {
    try {
      const { logCritical } = await import("../../../../lib/critical-log");
      await logCritical("catalog/products", e);
    } catch (_) {}
    return NextResponse.json(
      { products: [], error: String(e?.message || e) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const list = Array.isArray(body?.products) ? body.products : null;
    if (!list) {
      return NextResponse.json({ error: "products array required" }, { status: 400 });
    }

    let sellerScope = body.sellerId || body.seller_id || null;
    if (sellerScope && !isUuid(String(sellerScope))) {
      // تلاش: پیدا کردن seller با owner / user (اگر client اشتباه فرستاد)
      sellerScope = null;
    }

    const sb = createAdminClient();
    const saved = [];
    const idMap = {}; // oldId -> newUuid برای کلاینت

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      let id = p.id != null ? String(p.id) : "";
      if (!isUuid(id)) {
        id = randomUUID();
        if (p.id) idMap[String(p.id)] = id;
      }

      let seller_id =
        p.sellerId || p.seller_id || (p.seller && p.seller.id) || sellerScope || null;
      if (seller_id != null) seller_id = String(seller_id);
      if (seller_id && !isUuid(seller_id)) {
        // id فروشنده نامعتبر → null (ردیف ذخیره می‌شود؛ بعداً با me وصل می‌شود)
        seller_id = sellerScope && isUuid(String(sellerScope)) ? String(sellerScope) : null;
      }

      const name = String(p.name || p.title || "محصول").trim();
      const base_price = parsePrice(p);
      const images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      const cover_image =
        images[p.featuredImageIndex || 0] || images[0] || p.cover_image || null;

      // فقط uuid برای FK؛ وگرنه null (نام برند/دسته در payload می‌ماند)
      const brand_id =
        p.brand_id && isUuid(String(p.brand_id))
          ? p.brand_id
          : p.brandId && isUuid(String(p.brandId))
            ? p.brandId
            : null;
      const category_id =
        p.category_id && isUuid(String(p.category_id)) ? p.category_id : null;

      const statusRaw = String(p.status || "pending");
      const status =
        statusRaw === "active"
          ? "pending" // فروشنده مستقیم active نکند از این مسیر bulk
          : statusRaw === "archived" || statusRaw === "draft"
            ? statusRaw
            : "pending";

      const payload = {
        ...p,
        id,
        sellerId: seller_id,
        productCode: p.productCode || p.product_code || null,
      };

      const row = {
        id,
        seller_id,
        name,
        title: name,
        slug: p.slug || null,
        description: p.desc || p.description || null,
        base_price,
        status,
        cover_image,
        images,
        category_id,
        brand_id,
        product_code: p.productCode || p.product_code || null,
        payload,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await sb
        .from("products")
        .upsert(row, { onConflict: "id" })
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("[catalog/products PUT item]", error, { id, seller_id });
        return NextResponse.json(
          { error: error.message, id, details: error },
          { status: 500 }
        );
      }
      saved.push(rowToUi(data || row));
    }

    if (sellerScope && isUuid(String(sellerScope))) {
      const ids = saved.map((x) => x.id);
      const { data: existing } = await sb
        .from("products")
        .select("id")
        .eq("seller_id", String(sellerScope));
      const toArchive = (existing || [])
        .map((r) => r.id)
        .filter((id) => !ids.includes(id));
      if (toArchive.length) {
        await sb.from("products").update({ status: "archived" }).in("id", toArchive);
      }
    }

    return NextResponse.json({ ok: true, products: saved, idMap });
  } catch (e) {
    console.error("[catalog/products PUT]", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
