import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withCatalogCache, cacheKey } from '../../../../lib/catalog-cache';
import { logCritical } from '../../../../lib/critical-log';

export const revalidate = 60;

export async function GET(req) {
  const key = cacheKey(['catalog', 'sellers', req?.url || 'sellers']);
  try {
    return await withCatalogCache(key, async () => {
      const sb = createAdminClient();
      const { data, error } = await sb
        .from('sellers')
        .select(
          'id, shop_name, slug, status, about, city, logo_url, banner_url, rating, rating_count, created_at, updated_at'
        )
        .eq('status', 'approved')
        .order('rating', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json(
          { ok: false, sellers: [], error: error.message },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      }

      const sellers = data || [];
      const ids = sellers.map((s) => s.id).filter(Boolean);
      const countMap = {};
      const activeMap = {};

      if (ids.length) {
        const { data: prows } = await sb
          .from('products')
          .select('id, seller_id, status')
          .in('seller_id', ids);
        for (const pr of prows || []) {
          countMap[pr.seller_id] = (countMap[pr.seller_id] || 0) + 1;
          if (pr.status === 'active') {
            activeMap[pr.seller_id] = (activeMap[pr.seller_id] || 0) + 1;
          }
        }
      }

      for (const s of sellers) {
        s.products_count = countMap[s.id] || 0;
        s.active_products_count = activeMap[s.id] || 0;
      }

      return NextResponse.json(
        { ok: true, sellers },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
      );
    });
  } catch (e) {
    try {
      await logCritical('catalog/sellers', e);
    } catch (_lc) {}
    return NextResponse.json(
      { ok: false, sellers: [], error: String(e?.message || e) },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
