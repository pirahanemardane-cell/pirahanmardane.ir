/** Catalog API helpers */

async function getJson(url, opts = {}) {
  const res = await fetch(url, { cache: "no-store", ...opts });
  return res.json().catch(() => ({}));
}

async function putJson(url, body, opts = {}) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
    ...opts,
  });
  return res.json().catch(() => ({}));
}

/** GET /api/catalog/products */
export async function fetchCatalogProducts(params = {}) {
  const q = new URLSearchParams();
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.sellerId != null) q.set("sellerId", String(params.sellerId));
  if (params.bust) q.set("_", String(Date.now()));
  const qs = q.toString();
  return getJson("/api/catalog/products" + (qs ? "?" + qs : ""), {
    credentials: params.credentials === false ? undefined : "include",
    headers: params.headers || { Accept: "application/json" },
  });
}

/** PUT /api/catalog/products */
export async function putCatalogProducts(payload) {
  return putJson("/api/catalog/products", payload, { credentials: "include" });
}

export async function fetchCatalogCategories() {
  return getJson("/api/catalog/categories");
}
export async function putCatalogCategories(categories) {
  return putJson("/api/catalog/categories", { categories });
}

export async function fetchCatalogTags() {
  return getJson("/api/catalog/tags");
}
export async function putCatalogTags(tags) {
  return putJson("/api/catalog/tags", { tags });
}

export async function fetchCatalogColors() {
  return getJson("/api/catalog/colors");
}
export async function putCatalogColors(colors) {
  return putJson("/api/catalog/colors", { colors });
}

export async function fetchCatalogSizes() {
  return getJson("/api/catalog/sizes");
}
export async function putCatalogSizes(sizes) {
  return putJson("/api/catalog/sizes", { sizes });
}

export async function fetchCatalogBrands() {
  return getJson("/api/catalog/brands");
}
export async function putCatalogBrands(brands) {
  return putJson("/api/catalog/brands", { brands }, { credentials: "include" });
}

export async function fetchCatalogAttributes() {
  return getJson("/api/catalog/attributes");
}
export async function putCatalogAttributes(attributes) {
  return putJson("/api/catalog/attributes", { attributes });
}

export async function fetchCatalogSellers() {
  return getJson("/api/catalog/sellers", {
    headers: { Accept: "application/json" },
  });
}
