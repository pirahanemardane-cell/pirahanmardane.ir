/** پیش‌فرض دسته/برچسب فروشگاه و دسته بلاگ */

export function defaultAdminCategories() {
  return [
    {
      id: "cat-rasmi",
      name: "رسمی",
      slug: "rasmi",
      url: "/shop?cat=rasmi",
      indexable: true,
      active: true,
      image: "/logo.webp",
      description:
        "پیراهن رسمی مردانه برای محیط کار، مراسم و استایل کلاسیک. تنوع پارچه و رنگ از فروشندگان معتبر.",
    },
    {
      id: "cat-kravati",
      name: "کروات",
      slug: "kravati",
      url: "/shop?cat=kravati",
      indexable: true,
      active: true,
      image: "/logo.webp",
      description: "پیراهن مناسب کروات با یقه رسمی و دوخت دقیق برای استایل اداری و رسمی.",
    },
    {
      id: "cat-short",
      name: "آستین کوتاه",
      slug: "astin-kutah",
      url: "/shop?cat=astin-kutah",
      indexable: true,
      active: true,
      image: "/logo.webp",
      description: "پیراهن آستین کوتاه و لینن برای فصل گرم؛ سبک، خنک و مناسب استفاده روزمره.",
    },
  ];
}

export function defaultAdminTags() {
  return [
    {
      id: "tag-linen",
      name: "لینن",
      slug: "linen",
      url: "/shop?tag=linen",
      indexable: false,
      active: true,
      image: "/logo.webp",
      description:
        "محصولات با پارچه لینن — خنک و مناسب تابستان. این صفحه برچسب است و ایندکس نمی‌شود.",
    },
    {
      id: "tag-summer",
      name: "تابستانه",
      slug: "tabestane",
      url: "/shop?tag=tabestane",
      indexable: false,
      active: true,
      image: "/logo.webp",
      description: "انتخاب‌های سبک و خنک برای فصل تابستان. صفحه برچسب — noindex.",
    },
    {
      id: "tag-luxury",
      name: "لوکس",
      slug: "luxury",
      url: "/shop?tag=luxury",
      indexable: false,
      active: true,
      image: "/logo.webp",
      description: "محصولات با دوخت و متریال لوکس. صفحه برچسب — noindex.",
    },
  ];
}

export function defaultAdminBlogCategories() {
  return [
    { id: "bc-guide", name: "راهنمای خرید", active: true },
    { id: "bc-fashion", name: "مد و فشن", active: true },
    { id: "bc-care", name: "مراقبت و نگهداری", active: true },
    { id: "bc-news", name: "اخبار فروشگاه", active: true },
    { id: "bc-other", name: "سایر", active: true },
  ];
}
