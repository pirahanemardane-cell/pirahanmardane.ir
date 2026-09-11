/** تجمیع دادهٔ شبیه‌سازی‌شده Search Console */

export const GSC_STORAGE_KEY = "siteGscConsole";

export const GSC_RANGE_MS = {
  "24h": 86400000,
  "7d": 7 * 86400000,
  "28d": 28 * 86400000,
  "3m": 90 * 86400000,
  "6m": 180 * 86400000,
  "16m": 480 * 86400000,
};

export function buildGscSeed() {
  return {};
}

export function loadGscStoreFromLocal() {
  try {
    const raw = localStorage.getItem(GSC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.performance) && parsed.performance.length > 50) return parsed;
    }
  } catch (_) {}
  const seed = buildGscSeed();
  try {
    localStorage.setItem(GSC_STORAGE_KEY, JSON.stringify(seed));
  } catch (_) {}
  return seed;
}

export function persistGscToLocal(next) {
  try {
    localStorage.setItem(GSC_STORAGE_KEY, JSON.stringify(next));
  } catch (_) {}
}

export function gscAggregate(performance, rangeKey = "28d", dim = "queries") {
  const ms = GSC_RANGE_MS[rangeKey] || GSC_RANGE_MS["28d"];
  const cut = Date.now() - ms;
  const dimMap = {
    queries: "query",
    pages: "page",
    countries: "country",
    devices: "device",
    dates: "date",
    searchAppearance: "query",
  };
  const want = dimMap[dim] || "query";
  const list = (performance || []).filter((r) => {
    const ts = Date.parse(r.date + "T12:00:00Z") || 0;
    return ts >= cut && (dim === "dates" ? true : r.dim === want);
  });
  const bucket = {};
  list.forEach((r) => {
    const key = dim === "dates" ? r.date : (r.keys && r.keys[0]) || "(not set)";
    if (dim !== "dates" && r.dim !== want) return;
    if (!bucket[key]) bucket[key] = { key, clicks: 0, impressions: 0, posSum: 0, n: 0 };
    bucket[key].clicks += r.clicks || 0;
    bucket[key].impressions += r.impressions || 0;
    bucket[key].posSum += (r.position || 0) * (r.impressions || 1);
    bucket[key].n += r.impressions || 1;
  });
  const rows = Object.values(bucket)
    .map((b) => ({
      key: b.key,
      clicks: b.clicks,
      impressions: b.impressions,
      ctr: b.impressions ? b.clicks / b.impressions : 0,
      position: b.n ? b.posSum / b.n : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);
  const totals = rows.reduce(
    (a, r) => ({
      clicks: a.clicks + r.clicks,
      impressions: a.impressions + r.impressions,
    }),
    { clicks: 0, impressions: 0 }
  );
  totals.ctr = totals.impressions ? totals.clicks / totals.impressions : 0;
  totals.position = rows.length ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;
  return { rows, totals, list };
}

/** بازرسی شبیه‌سازی‌شده URL — بدون setState */
export function buildGscInspectResult(url, gscStore) {
  const u = String(url || "").trim() || "/";
  const path = u.replace(/^https?:\/\/[^/]+/i, "") || "/";
  return {
    url: path,
    inspectedAt: new Date().toISOString(),
    coverage: Math.random() > 0.15 ? "URL is on Google" : "URL is not on Google",
    indexing: Math.random() > 0.2 ? "Indexed" : "Discovered - currently not indexed",
    crawledAs: Math.random() > 0.5 ? "MOBILE" : "DESKTOP",
    lastCrawl: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
    robots: "Allowed",
    indexingAllowed: "Yes",
    pageFetch: "Successful",
    canonicalUser: path,
    canonicalGoogle: path,
    mobileFriendly: Math.random() > 0.1 ? "Yes" : "No",
    richResults: Math.random() > 0.6 ? ["Product", "BreadcrumbList"] : ["BreadcrumbList"],
    referringSitemaps: (gscStore?.sitemaps || []).slice(0, 2).map((s) => s.path),
  };
}
