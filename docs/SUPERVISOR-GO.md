# Supervisor Final GO — Real Testing (no payment gateway)

**Date:** 2026-09-13  
**Live deploy checked:** production `pirahanmardane.ir`  
**Scope:** Buyer/seller functional testing excluding real payment PSP.

## Verdict: **GO**

| Area | Status | Evidence |
|------|--------|----------|
| Realtime publication | GO | products, orders, carts, catalog_*, sellers, … in `supabase_realtime` |
| DB + catalog data | GO | 10 products, categories/brands/colors, sizes S–4XL |
| Auth guards | GO | seller/orders/cart/admin → 401 unauthenticated |
| Payment | OUT OF SCOPE | mock only; POST payments → 401 when logged out |
| UI storefront min-bar | GO | PLP rebuild, cookie, skip-link, legal defaults |
| UX critical paths | GO | cart empty, checkout mock label, legal pages |
| Responsive / mobile | GO for test | PLP mobile sheets + 48px targets (verify on device) |
| Google standards (tech) | GO partial | title/desc/og/canonical/lang/rtl OK; **noindex on purpose** |
| Load speed | GO | home ~40ms TTFB, shop ~0.3s, products API ~0.1s |
| APIs | GO | catalog/*, health ok, shipping, site-settings, blog |
| Router (FA paths) | GO | /, /فروشگاه, /درباره-ما, /مجله → 200 |
| Security headers | GO | HSTS, CSP, nosniff, frame-options |
| Secret leak in HTML | GO | no service_role / JWT in homepage HTML |

## Known non-blockers
- `health` latency ~2s (admin DB probe); buyer paths fast
- `db_user_detail`: permission denied on `profiles` via user client (health still ok via admin)
- robots + X-Robots-Tag noindex until `SITE_NOINDEX=false` on Vercel
- Real payment gateway intentionally disabled

## Tester checklist (15 min)
1. Incognito → shop → filter size S/M/L → open PDP
2. Add to cart → cart page → checkout until experimental payment
3. Legal pages: about, terms, privacy, returns, FAQ
4. Two tabs realtime: change stock/product see live update
5. Mobile width: filter sheet, sort sheet, sticky actions
