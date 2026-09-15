/** کلیدها و ساخت payload بک‌آپ کامل سایت */

export const FULL_BACKUP_KEYS = [
  "adminOrders",
  "adminSellers",
  "adminProducts",
  "adminCoupons",
  "adminTickets",
  "adminBuyers",
  "adminShippingMethods",
  "adminCatalogCategories",
  "adminCatalogTags",
  "adminCatalogBrands",
  "adminCategories",
  "adminTags",
  "adminBlogCategories",
  "adminCatalogColors",
  "adminCatalogSizes",
  "adminCatalogAttrs",
  "adminSettings",
  "adminBlogPosts",
  "adminCampaigns",
  "adminPageContent",
  "adminModerationQueue",
  "sellerUser",
  "sellerProducts",
  "sellerOrders",
  "sellerGifts",
  "sellerTickets",
  "buyerUser",
  "buyerOrders",
  "buyerTickets",
  "cart",
  "favorites",
  "compare",
  "recentlyViewed",
  "buyerAddresses",
  "notifications",
];

export function collectFullSiteBackupPayload(extra = {}) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    site: "pirahanemardane",
    payload: {},
  };
  FULL_BACKUP_KEYS.forEach((k) => {
    try {
      data.payload[k] = JSON.parse(localStorage.getItem(k) || "null");
    } catch {
      data.payload[k] = null;
    }
  });
  Object.assign(data.payload, extra || {});
  return data;
}

export function isValidFullSiteBackup(data) {
  return !!(data && data.site === "pirahanemardane" && data.payload);
}

export const ADMIN_PRESET = { name: "سوپر ادمین", role: "Super Admin" };
