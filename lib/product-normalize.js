/** Product shape normalize — extracted from App (قدم ۶۷) */

export function normalizeProduct(p, opts = {}) {
  const {
    now = Date.now(),
    toFa = (x) => String(x ?? ""),
    isUsableProductImage,
    pickProductImage,
  } = opts;

          if (!p) return null;
          let out = { ...p };
          const expired = out.dealEndsAt && Number(out.dealEndsAt) < now;
          if (expired && out.amazing) {
            const restoreRaw = out.priceBeforeDeal != null ? out.priceBeforeDeal : out.oldPrice;
            const restore = typeof restoreRaw === 'number' ? restoreRaw : Number(String(restoreRaw || '').replace(/[^\d]/g, '')) || 0;
            if (restore > 0) {
              out.price = restore;
              try { out.priceText = toFa(restore.toLocaleString()); } catch (_) {}
            }
            out.amazing = false;
            out.discount = 0;
          }
          {
            const img =
              (typeof isUsableProductImage === 'function' && typeof pickProductImage === 'function')
                ? pickProductImage(out)
                : ((out.images && out.images[out.featuredImageIndex || 0]) || out.images?.[0] || out.image || out.cover_image || '');
            if (img) {
              out.image = out.image && String(out.image).length > 12 ? out.image : img;
              out.cover_image = out.cover_image || img;
              if (!Array.isArray(out.images) || !out.images.length) out.images = [img];
            }
            if (!out.colors || !out.colors.length) {
              out.colors = [{ name: out.colorName || 'پیش‌فرض', hex: '#999', image: img || '/logo.webp' }];
            } else {
              out.colors = out.colors.map((c, i) => {
                const bad = !c || !c.image || String(c.image).length < 12 || /^https?:\/\/?$/i.test(String(c.image).trim());
                if (!bad) return c;
                const fallback = (out.images && out.images[i]) || img || '/logo.webp';
                return { ...(c || {}), image: fallback };
              });
            }
          }
          const sName = (out.seller && out.seller.name && out.seller.name !== 'undefined')
            ? out.seller.name
            : (out.sellerName || out.seller_name || out.brandName || out.brand || 'فروشگاه');
          out.seller = {
            id: (out.seller && out.seller.id) || out.sellerId || out.seller_id || 'own',
            name: sName,
          };
          out.sellerName = sName;
          return out;
        
}
