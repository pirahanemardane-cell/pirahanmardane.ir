/** نگاشت ردیف‌های ادمین محصول/فروشنده از API — pure */

export function mapAdminProductRow(p, sellersList) {
        if (!p) return null;
        const payload = p.payload && typeof p.payload === 'object' ? p.payload : {};
        const imgs = Array.isArray(p.images) && p.images.length
          ? p.images
          : (Array.isArray(payload.images) ? payload.images : (p.cover_image || p.image ? [p.cover_image || p.image] : []));
        const sellerJoin = p.sellers || p.seller || null;
        const sid = p.seller_id || p.sellerId || sellerJoin?.id || null;
        let sellerName =
          (sellerJoin && (sellerJoin.shop_name || sellerJoin.name)) ||
          p.seller_name || p.sellerName || payload.sellerName || '';
        if (!sellerName && sid && Array.isArray(sellersList)) {
          const hit = sellersList.find((s) => String(s.id) === String(sid));
          if (hit) sellerName = hit.shopName || hit.shop_name || hit.name || '';
        }
        const name = p.name || p.title || payload.name || '';
        const colors = Array.isArray(payload.colors) ? payload.colors : (Array.isArray(p.colors) ? p.colors : []);
        const sizes = Array.isArray(payload.sizes) ? payload.sizes : (Array.isArray(p.sizes) ? p.sizes : []);
        const tags = Array.isArray(payload.tags) ? payload.tags : (Array.isArray(p.tags) ? p.tags : []);
        const attributes = payload.attributes || payload.attrs || p.attributes || {};
        return {
          id: p.id,
          name,
          title: p.title || p.name || name,
          status: p.status || 'pending',
          contentStatus: p.status === 'active' ? 'approved' : (p.status === 'rejected' ? 'rejected' : 'pending'),
          price: p.base_price ?? p.price ?? payload.price ?? 0,
          sellerId: sid,
          sellerName: sellerName || '—',
          image: p.cover_image || p.image || imgs[0] || '',
          images: imgs,
          createdAt: p.created_at || p.createdAt || null,
          updatedAt: p.updated_at || p.updatedAt || null,
          slug: p.slug || '',
          productCode: p.product_code || payload.productCode || '',
          category: payload.category || payload.category_name || p.category || '',
          categoryId: p.category_id || p.categoryId,
          brand: payload.brand || payload.brand_name || p.brand || '',
          brandId: p.brand_id || p.brandId,
          colors,
          sizes,
          tags,
          attributes,
          stock: payload.stock ?? p.stock ?? 0,
          description: p.description || payload.desc || payload.description || '',
        };
      }

export function mapAdminSellerRow(s) {
        if (!s) return null;
        const shop = String(s.shop_name || s.shopName || s.name || '').trim();
        const phone = s.phone || '';
        const logo = s.logo_url || s.logoUrl || s.logo || '';
        const banner = s.banner_url || s.bannerUrl || s.banner || '';
        return {
          id: s.id,
          shopName: shop || (phone ? ('فروشگاه ' + String(phone).slice(-4)) : 'فروشگاه'),
          name: shop || (phone ? ('فروشگاه ' + String(phone).slice(-4)) : 'فروشگاه'),
          slug: s.slug || '',
          status: s.status || 'pending',
          ownerId: s.owner_id || s.ownerId,
          ownerName: s.owner_name || s.ownerName || '',
          phone,
          city: s.city || '',
          about: s.about || '',
          sheba: s.sheba || '',
          address: s.address || '',
          logo,
          logo_url: logo,
          logoUrl: logo,
          banner,
          banner_url: banner,
          bannerUrl: banner,
          logo_pending_url: s.logo_pending_url || s.logoPendingUrl || '',
          logoPendingUrl: s.logo_pending_url || s.logoPendingUrl || '',
          banner_pending_url: s.banner_pending_url || s.bannerPendingUrl || '',
          bannerPendingUrl: s.banner_pending_url || s.bannerPendingUrl || '',
          logo_status: s.logo_status || s.logoStatus || '',
          logoStatus: s.logo_status || s.logoStatus || '',
          banner_status: s.banner_status || s.bannerStatus || '',
          bannerStatus: s.banner_status || s.bannerStatus || '',
          rating: s.rating != null ? Number(s.rating) : 0,
          productsCount: s.products_count != null ? Number(s.products_count) : (s.productsCount || 0),
          activeProductsCount: s.active_products_count != null ? Number(s.active_products_count) : (s.activeProductsCount || 0),
          ordersCount: s.orders_count != null ? Number(s.orders_count) : (s.ordersCount || 0),
          createdAt: s.created_at || s.createdAt,
          joinDate: s.joinDate || (s.created_at ? new Date(s.created_at).toLocaleDateString('fa-IR') : ''),
          licenseApproved: (s.status || '') === 'approved' || s.licenseApproved === true,
          canSell: (s.status || '') === 'approved',
          fastShipEnabled: s.fastShipEnabled !== false,
        };
      }
