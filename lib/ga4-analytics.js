/** آنالیتیکس محلی GA4 — بارگذاری، ثبت، فیلتر، تجمیع */

import { GA4_STORAGE_KEY } from "@/lib/site-content";

export const GA4_RANGE_MS = {
  "24h": 86400000,
  "7d": 7 * 86400000,
  "28d": 28 * 86400000,
  "90d": 90 * 86400000,
};

export function buildGa4Seed() {
  return {};
}

export function loadGa4Store() {
  try {
    const raw = localStorage.getItem(GA4_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.events) && parsed.events.length > 100) return parsed;
    }
  } catch (_) {}
  const seed = buildGa4Seed();
  try {
    localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify(seed));
  } catch (_) {}
  return seed;
}

export function buildGa4EventRow(name, params = {}, ctx = {}) {
  const page_path =
    ctx.page_path ||
    (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  return {
    name: String(name || "custom_event"),
    ts: Date.now(),
    params: { ...params },
    user_id: ctx.user_id || "anon",
    source: ctx.source || "direct",
    medium: ctx.medium || "(none)",
    campaign: ctx.campaign || "(direct)",
    device:
      ctx.device ||
      (typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop"),
    browser: ctx.browser || "Chrome",
    os: ctx.os || "Unknown",
    city: ctx.city || "تهران",
    country: ctx.country || "IR",
    page_path,
  };
}

export function appendGa4Event(prev, row) {
  const base = prev && Array.isArray(prev.events) ? prev : loadGa4Store();
  const events = [row, ...(base.events || [])].slice(0, 25000);
  const next = { ...base, events };
  try {
    localStorage.setItem(GA4_STORAGE_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
}

export function pushGa4ToWindow(name, params = {}) {
  if (typeof window === "undefined") return;
  if (window.gtag) {
    try {
      window.gtag("event", name, params);
    } catch (_) {}
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
}

export function ga4FilterEvents(events, rangeKey = "28d") {
  const ms = GA4_RANGE_MS[rangeKey] || GA4_RANGE_MS["28d"];
  const cut = Date.now() - ms;
  return (events || []).filter((e) => (e.ts || 0) >= cut);
}

export function ga4Aggregate(events, rangeKey = "28d") {
  const list = ga4FilterEvents(events, rangeKey);
  const users = new Set();
  const sessions = new Set();
  let pageViews = 0,
    purchases = 0,
    revenue = 0,
    addToCarts = 0,
    checkouts = 0,
    engaged = 0;
  const bySource = {};
  const byPage = {};
  const byEvent = {};
  const byDevice = {};
  const byBrowser = {};
  const byOs = {};
  const byCity = {};
  const byCountry = {};
  const byLanding = {};
  const byCampaign = {};
  const byItem = {};
  const byHour = Array.from({ length: 24 }, () => 0);
  const byDay = {};
  const searchTerms = {};

  list.forEach((e) => {
    if (e.user_id) users.add(e.user_id);
    const sid = e.params?.session_id || `${e.user_id}_${new Date(e.ts).toDateString()}`;
    sessions.add(sid);
    byEvent[e.name] = (byEvent[e.name] || 0) + 1;
    const dev = e.device || "unknown";
    byDevice[dev] = (byDevice[dev] || 0) + 1;
    const br = e.browser || "unknown";
    byBrowser[br] = (byBrowser[br] || 0) + 1;
    const os = e.os || "unknown";
    byOs[os] = (byOs[os] || 0) + 1;
    const city = e.city || "unknown";
    byCity[city] = (byCity[city] || 0) + 1;
    const country = e.country || "unknown";
    byCountry[country] = (byCountry[country] || 0) + 1;
    const srcKey = `${e.source || "(direct)"} / ${e.medium || "(none)"}`;
    bySource[srcKey] = bySource[srcKey] || {
      users: new Set(),
      events: 0,
      revenue: 0,
      sessions: new Set(),
    };
    bySource[srcKey].events += 1;
    bySource[srcKey].users.add(e.user_id);
    bySource[srcKey].sessions.add(sid);
    const camp = e.campaign || "(not set)";
    byCampaign[camp] = (byCampaign[camp] || 0) + 1;
    const hour = new Date(e.ts).getHours();
    byHour[hour] += 1;
    const dayKey = new Date(e.ts).toISOString().slice(0, 10);
    byDay[dayKey] = (byDay[dayKey] || 0) + 1;
    if (e.name === "page_view") {
      pageViews += 1;
      const pg = e.page_path || e.params?.page_location || "/";
      byPage[pg] = (byPage[pg] || 0) + 1;
    }
    if (e.name === "session_start") {
      const lp = e.page_path || "/";
      byLanding[lp] = (byLanding[lp] || 0) + 1;
    }
    if (e.name === "add_to_cart") addToCarts += 1;
    if (e.name === "begin_checkout") checkouts += 1;
    if (e.name === "purchase") {
      purchases += 1;
      const val = Number(e.params?.value) || 0;
      revenue += val;
      bySource[srcKey].revenue += val;
      (e.params?.items || []).forEach((it) => {
        const id = it.item_id || it.item_name;
        byItem[id] = byItem[id] || { name: it.item_name, qty: 0, revenue: 0 };
        byItem[id].qty += 1;
        byItem[id].revenue += Number(it.price) || 0;
      });
    }
    if (e.name === "user_engagement" || e.name === "scroll") engaged += 1;
    if (e.name === "search" && e.params?.search_term) {
      const st = e.params.search_term;
      searchTerms[st] = (searchTerms[st] || 0) + 1;
    }
  });

  const sourceRows = Object.entries(bySource)
    .map(([k, v]) => ({
      key: k,
      users: v.users.size,
      sessions: v.sessions.size,
      events: v.events,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.users - a.users);
  const top = (obj, n = 10) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    list,
    activeUsers: users.size,
    sessions: sessions.size,
    pageViews,
    purchases,
    revenue,
    addToCarts,
    checkouts,
    engaged,
    conversionRate: sessions.size ? (purchases / sessions.size) * 100 : 0,
    avgViewsPerSession: sessions.size ? pageViews / sessions.size : 0,
    sourceRows,
    topPages: top(byPage),
    topEvents: top(byEvent, 20),
    topDevices: top(byDevice),
    topBrowsers: top(byBrowser),
    topOs: top(byOs),
    topCities: top(byCity),
    topCountries: top(byCountry),
    topLandings: top(byLanding),
    topCampaigns: top(byCampaign),
    topItems: Object.entries(byItem)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15),
    byHour,
    byDay,
    searchTerms: top(searchTerms, 15),
    funnel: {
      view_item: list.filter((e) => e.name === "view_item").length,
      add_to_cart: addToCarts,
      begin_checkout: checkouts,
      purchase: purchases,
    },
  };
}
