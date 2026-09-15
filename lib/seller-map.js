/** نگاشت پروفایل کاربر به شیء فروشنده نمایشی */

export function mapProfileToSeller(user, profile, extra = {}, now = Date.now()) {
  const shopId = extra.id || extra.sellerId || profile?.seller_id || null;
  return {
    // فقط id واقعی فروشگاه از جدول sellers — نه id کاربر
    id: shopId || null,
    ownerId: user?.id || profile?.id || null,
    email: user?.email || "",
    phone: profile?.phone || extra.phone || "",
    shopName: extra.shopName || extra.shop_name || profile?.full_name || "فروشگاه من",
    ownerName: extra.ownerName || profile?.full_name || "",
    city: extra.city || "",
    province: extra.province || "",
    address: extra.address || "",
    about: extra.about || "",
    logo: extra.logoUrl || extra.logo_url || extra.logo || "",
    banner: extra.bannerUrl || extra.banner_url || "",
    instagram: "",
    sheba: extra.sheba || "",
    card: "",
    status: extra.status || "pending",
    licenseApproved: extra.licenseApproved === true || extra.status === "approved",
    canSell: extra.canSell === true || extra.status === "approved",
    createdAt: now,
    supabase: true,
    _needsShop: !shopId,
  };
}
