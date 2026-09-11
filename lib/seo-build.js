/** SEO XML/schema builders — pure (deps as params) */

export function buildRobotsTxt(s) {const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const lines = [
          'User-agent: *',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          '',
          '# موتورهای جستجو',
          'User-agent: Googlebot',
          s.indexHome !== false ? 'Allow: /' : 'Disallow: /',
          'User-agent: Bingbot',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          'User-agent: Yandex',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          'User-agent: DuckDuckBot',
          s.globalIndex ? 'Allow: /' : 'Disallow: /',
          '',
          `Sitemap: ${base}/sitemap.xml`,
        ];
        if (!s.indexTags) {
          lines.push('Disallow: /*?tag=');
          lines.push('Disallow: /tag/');
        }
        if (s.robotsTxtExtra) lines.push('', s.robotsTxtExtra.trim());
        return lines.join('\\n') + '\\n';
      }

export function buildSitemapXml(s, blogPosts = [], productsList = []) {const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const today = new Date().toISOString().slice(0, 10);
        const urls = [];
        const add = (loc, priority = '0.5', changefreq = 'weekly') => {
          urls.push({ loc: loc.startsWith('http') ? loc : base + loc, priority, changefreq });
        };
        if (s.indexHome) add('/', '1.0', 'daily');
        if (s.sitemapIncludeStatic && s.indexStatic) {
          ['/about', '/contact', '/faq', '/size-guide', '/terms', '/returns', '/privacy', '/blog', '/brands', '/campaigns', '/deals', '/sellers'].forEach(p => add(p, '0.6', 'monthly'));
        }
        if (s.sitemapIncludeCategories && s.indexCategories) {
          (adminCategories || []).filter(c => c.active !== false).forEach(cat => {
            add(`/shop?cat=${encodeURIComponent(cat.slug || cat.name)}`, '0.8', 'daily');
          });
        }
        if (s.sitemapIncludeProducts && s.indexProducts) {
          const prods = [...(adminProducts || []).filter(p => p.status === 'active' || p.status === 'approved'), ...(sellerProducts || []).filter(p => p.status === 'active' || p.status === 'approved' || (!p.status && p.active !== false)), ...(productsList || [])].filter(p => p && p.status !== 'pending' && p.status !== 'rejected' && p.status !== 'inactive');
          const seen = new Set();
          prods.forEach(p => {
            const key = p.productCode || p.id;
            if (seen.has(key)) return;
            seen.add(key);
            if (p.productCode) add(`/?product=${encodeURIComponent(p.productCode)}`, '0.9', 'weekly');
            else add(`/?id=${encodeURIComponent(p.id)}`, '0.7', 'weekly');
          });
        }
        if (s.sitemapIncludeBlog && s.indexBlog) {
          add('/blog', '0.7', 'weekly');
          (blogPosts || []).filter(b => b.status === 'published').forEach(b => {
            add(`/blog/${encodeURIComponent(b.id)}`, '0.6', 'monthly');
          });
        }
        if (s.sitemapIncludeSellers && s.indexSellers) {
          (adminSellers || []).filter(x => x.status === 'approved').forEach(sel => {
            add(`/seller/${encodeURIComponent(sel.id)}`, '0.5', 'weekly');
          });
        }
        const body = urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n${body}\\n</urlset>\\n`;
      }

export function buildSitemapIndexXml(s, productsList = []) {const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const now = new Date().toISOString();
        const parts = [
          { loc: `${base}/sitemap-static.xml`, lastmod: now },
          { loc: `${base}/sitemap-productsList.xml`, lastmod: now },
          { loc: `${base}/sitemap-blog.xml`, lastmod: now },
        ];
        if (s.newsSitemapEnabled) parts.push({ loc: `${base}/news-sitemap.xml`, lastmod: now });
        if (s.videoSitemapEnabled) parts.push({ loc: `${base}/video-sitemap.xml`, lastmod: now });
        const body = parts.map(p => `  <sitemap>\n    <loc>${p.loc}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </sitemap>`).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
      }

export function buildNewsSitemapXml(s, blogPosts = []) {const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const posts = (blogPosts || []).filter(b => b.status === 'published').slice(0, 100);
        const body = posts.map(b => {
          const loc = `${base}/blog/${encodeURIComponent(b.id)}`;
          const title = (b.seoTitle || b.title || '').replace(/&/g, '&amp;');
          const date = b.date || new Date().toISOString().slice(0, 10);
          return `  <url>\\n    <loc>${loc}</loc>\\n    <news:news>\\n      <news:publication>\\n        <news:name>پیراهن مردانه</news:name>\\n        <news:language>fa</news:language>\\n      </news:publication>\\n      <news:publication_date>${date}</news:publication_date>\\n      <news:title>${title}</news:title>\\n    </news:news>\\n  </url>`;
        }).join('\\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\\n${body}\\n</urlset>\\n`;
      }

export function buildVideoSitemapXml(s, productsList = []) {const base = (s.canonicalBase || 'https://pirahanemardane.ir').replace(/\/$/, '');
        const withVideo = [...(productsList || [])].filter(pr => pr.aparatEmbed || pr.video).slice(0, 50);
        const body = withVideo.map(pr => {
          const loc = `${base}${pathForProduct(pr.name || pr.title, pr.shopName || pr.sellerName || pr.brand || '')}`;
          const title = (pr.seoTitle || pr.name || '').replace(/&/g, '&amp;');
          const desc = String(pr.seoDescription || pr.desc || title).replace(/<[^>]+>/g, '').slice(0, 200).replace(/&/g, '&amp;');
          const thumb = pr.colors?.[0]?.image || pr.images?.[0] || pr.image || '';
          return `  <url>\\n    <loc>${loc}</loc>\\n    <video:video>\\n      <video:title>${title}</video:title>\\n      <video:description>${desc}</video:description>\\n      ${thumb ? `<video:thumbnail_loc>${thumb}</video:thumbnail_loc>` : ''}\\n      <video:player_loc>${(pr.aparatEmbed || pr.video || loc).replace(/&/g, '&amp;')}</video:player_loc>\\n    </video:video>\\n  </url>`;
        }).join('\\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\\n${body}\\n</urlset>\\n`;
      }

export function buildLocalBusinessSchema(s) {if (!s.localSeoEnabled) return null;
        const locs = Array.isArray(s.localLocations) ? s.localLocations : [];
        if (!locs.length) {
          return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: s.localBusinessName || s.siteTitle,
            telephone: s.localPhone || undefined,
            email: s.localEmail || undefined,
          };
        }
        if (locs.length === 1) {
          const L = locs[0];
          return {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: L.name || s.localBusinessName || s.siteTitle,
            image: (s.canonicalBase || '') + '/logo.webp',
            telephone: L.phone || s.localPhone,
            email: s.localEmail || undefined,
            priceRange: s.localPriceRange || '$$',
            address: {
              '@type': 'PostalAddress',
              streetAddress: L.address || '',
              addressLocality: L.city || '',
              postalCode: L.postalCode || '',
              addressCountry: 'IR',
            },
            geo: (L.lat && L.lng) ? { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lng } : undefined,
            openingHours: L.hours || undefined,
            url: (s.canonicalBase || '').replace(/\/$/, ''),
          };
        }
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: s.localBusinessName || s.siteTitle,
          telephone: s.localPhone,
          email: s.localEmail,
          department: locs.map(L => ({
            '@type': 'LocalBusiness',
            name: L.name,
            telephone: L.phone || s.localPhone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: L.address || '',
              addressLocality: L.city || '',
              postalCode: L.postalCode || '',
              addressCountry: 'IR',
            },
            geo: (L.lat && L.lng) ? { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lng } : undefined,
            openingHours: L.hours || undefined,
          })),
        };
      }

