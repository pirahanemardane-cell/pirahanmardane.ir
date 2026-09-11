/** SEO page context builder — extracted from App (قدم ۶۶) */

export function buildCurrentPageSeoContext(env = {}) {
  const {
    seoCfg, pdpProduct, showPLP, plpCats, adminCategories, plpTagFilter, adminTags, staticPage, blogPosts, brandDetailId, blogForm, showAdminPanel, slugifyTaxonomy
  } = env;


        const s = seoCfg();
        if (pdpProduct) {
          return {
            key: `product:${pdpProduct.id}`,
            type: 'product',
            typeLabel: 'صفحه محصول',
            label: pdpProduct.name,
            defaults: {
              title: pdpProduct.seoTitle || pdpProduct.name || '',
              description: pdpProduct.seoDescription || pdpProduct.desc || '',
              slug: pdpProduct.slug || pdpProduct.productCode || String(pdpProduct.id),
              indexable: s.indexProducts !== false,
            },
            canEditContent: true,
          };
        }
        if (showPLP && plpCats?.length === 1) {
          const catName = plpCats[0];
          const cat = (adminCategories || []).find(x => x.name === catName);
          return {
            key: `category:${cat?.slug || catName}`,
            type: 'category',
            typeLabel: 'دسته‌بندی',
            label: catName,
            defaults: {
              title: cat?.seoTitle || catName,
              description: cat?.seoDescription || cat?.description || s.categoriesIndexSeoText || '',
              slug: cat?.slug || slugifyTaxonomy(catName),
              indexable: s.indexCategories !== false,
            },
          };
        }
        if (showPLP && plpTagFilter?.length) {
          const tagName = plpTagFilter[0];
          const tag = (adminTags || []).find(x => x.name === tagName);
          return {
            key: `tag:${tag?.slug || tagName}`,
            type: 'tag',
            typeLabel: 'برچسب',
            label: tagName,
            defaults: {
              title: tag?.seoTitle || tagName,
              description: tag?.seoDescription || '',
              slug: tag?.slug || slugifyTaxonomy(tagName),
              indexable: !!s.indexTags,
            },
          };
        }
        if (showPLP) {
          return {
            key: 'plp',
            type: 'plp',
            typeLabel: 'فروشگاه / لیست محصولات',
            label: 'فروشگاه',
            defaults: {
              title: 'فروشگاه',
              description: s.metaDescription || '',
              slug: 'shop',
              indexable: s.indexCategories !== false,
            },
          };
        }
        if (staticPage === 'blog-post' && blogPosts?.length) {
          const post = blogPosts.find(b => String(b.id) === String(brandDetailId || blogForm?.id)) || blogPosts[0];
          // try active blog post from static context - use first matching if state exists
          return {
            key: `blog-post:${post?.id || 'x'}`,
            type: 'blog-post',
            typeLabel: 'مقاله بلاگ',
            label: post?.title || 'مقاله',
            defaults: {
              title: post?.seoTitle || post?.title || '',
              description: post?.seoDescription || post?.excerpt || '',
              slug: post?.slug || String(post?.id || ''),
              indexable: s.indexBlogPosts !== false,
            },
          };
        }
        if (staticPage === 'blog') {
          return {
            key: 'blog',
            type: 'blog',
            typeLabel: 'بلاگ',
            label: 'بلاگ',
            defaults: { title: 'بلاگ', description: '', slug: 'blog', indexable: s.indexBlog !== false },
          };
        }
        if (staticPage) {
          const labels = { about: 'درباره ما', contact: 'تماس با ما', faq: 'سوالات متداول', terms: 'قوانین و شرایط', returns: 'شرایط بازگشت کالا', privacy: 'حریم خصوصی', cookies: 'کوکی', 'size-guide': 'راهنمای سایز', 'become-seller': 'فروشنده شوید', brands: 'برندها', campaigns: 'کمپین‌ها', deals: 'شگفت‌انگیز', amazing: 'شگفت‌انگیز', home: 'صفحه اصلی', sellers: 'فروشندگان', sitemap: 'نقشه سایت' };
          return {
            key: `static:${staticPage}`,
            type: 'static',
            typeLabel: 'صفحه ثابت',
            label: labels[staticPage] || staticPage,
            defaults: {
              title: labels[staticPage] || staticPage,
              description: '',
              slug: staticPage,
              indexable: s.indexStatic !== false,
            },
          };
        }
        if (activeSellerId) {
          return {
            key: `seller:${activeSellerId}`,
            type: 'seller',
            typeLabel: 'صفحه فروشنده',
            label: String(activeSellerId),
            defaults: { title: '', description: '', slug: String(activeSellerId), indexable: s.indexSellers !== false },
          };
        }
        if (showSellersList) {
          return {
            key: 'sellers',
            type: 'sellers',
            typeLabel: 'فهرست فروشندگان',
            label: 'فروشندگان',
            defaults: { title: 'فروشندگان', description: '', slug: 'sellers', indexable: true },
          };
        }
        if (showAdminPanel) {
          return { key: 'admin', type: 'admin', typeLabel: 'پنل ادمین', label: 'ادمین', defaults: { title: 'پنل ادمین', description: '', slug: 'admin', indexable: false } };
        }
        return {
          key: 'home',
          type: 'home',
          typeLabel: 'صفحه اصلی',
          label: 'خانه',
          defaults: {
            title: s.siteTitle || 'پیراهن مردانه',
            description: s.metaDescription || '',
            slug: '',
            indexable: s.indexHome !== false && s.globalIndex !== false,
          },
        };
      
}
