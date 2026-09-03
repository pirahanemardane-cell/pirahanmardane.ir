'use client';

import { useAppApi } from '../AppApiContext';

/** TaxonomyHubView — code-split from App.jsx */
export default function TaxonomyHubView() {
  const {
    Icon,
    adminCategories,
    adminSettings,
    adminTags,
    dark,
    openCategory,
    openTagPage,
    openTaxonomyHub,
    pdpProduct,
    showAdminPanel,
    showPLP,
    showProfilePage,
    showSellerPanel,
    showTaxonomyHub
  } = useAppApi();

  return (
    <>
          {showTaxonomyHub && !pdpProduct && !showPLP && !showProfilePage && !showSellerPanel && !showAdminPanel && (
            <div className="w-full flex-1 flex flex-col bg-primary-50 dark:bg-primary-950">
              <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-white">
                    {showTaxonomyHub === 'tags' ? 'همه برچسب‌ها' : 'همه دسته‌بندی‌ها'}
                  </h1>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openTaxonomyHub('categories')} className={`text-xs px-3 py-1.5 rounded-full border ${showTaxonomyHub === 'categories' ? 'bg-apple-blue text-white border-apple-blue' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>دسته‌ها</button>
                    <button type="button" onClick={() => openTaxonomyHub('tags')} className={`text-xs px-3 py-1.5 rounded-full border ${showTaxonomyHub === 'tags' ? 'bg-apple-blue text-white border-apple-blue' : 'plp-filter-chip border-primary-300 dark:border-white/50 !text-primary-900 dark:!text-white bg-white dark:bg-[#2A2C30] font-medium'}`}>برچسب‌ها</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showTaxonomyHub === 'tags' ? (adminTags || []) : (adminCategories || [])).filter((x) => x.active !== false).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      rel={showTaxonomyHub === 'tags' ? 'nofollow' : undefined}
                      onClick={() => (showTaxonomyHub === 'tags' ? openTagPage(item.name) : openCategory(item.name))}
                      className="text-right rounded-2xl border border-primary-200 dark:border-white/15 bg-white dark:bg-primary-900 overflow-hidden hover:border-apple-blue/40 transition group"
                    >
                      <div className="aspect-[16/9] bg-primary-100 dark:bg-primary-900 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover group-hover:opacity-95 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-300"><Icon name="grid" size={28} /></div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-primary-900 dark:text-white">{item.name}</p>
                          {showTaxonomyHub === 'tags' ? (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">noindex</span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">index</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-primary-500 dark:!text-white mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {/* توضیح کلی انتهای هاب */}
                <section className="mt-10 mb-4 p-5 sm:p-6 rounded-2xl border border-primary-100 dark:border-white/10 bg-white dark:bg-primary-900">
                  <h2 className="text-sm font-bold text-primary-900 dark:text-white mb-2">
                    {showTaxonomyHub === 'tags' ? 'درباره برچسب‌ها' : 'درباره دسته‌بندی‌ها'}
                  </h2>
                  <p className="text-sm text-primary-600 dark:text-white/70 leading-7 whitespace-pre-line">
                    {showTaxonomyHub === 'tags'
                      ? (adminSettings?.tagsIndexSeoText || '')
                      : (adminSettings?.categoriesIndexSeoText || '')}
                  </p>
                </section>
              </div>
            </div>
          )}

    </>
  );
}
