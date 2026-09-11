/** فرم و برچسب تاکسونومی — pure */

export function emptyTaxonomyForm(type = "category") {
  return {
    type,
    id: null,
    name: "",
    slug: "",
    url: "",
    image: "",
    images: [],
    imageAlts: [],
    featuredImageIndex: 0,
    description: "",
    imageAlt: "",
    seoTitle: "",
    seoDescription: "",
    seoFocusKeywords: "",
    seoCanonical: "",
    seoNoindex: false,
    seoFaq: [],
    step: 1,
  };
}

export function taxonomyTypeLabel(t) {
  return (
    {
      category: "دسته محصول",
      tag: "برچسب محصول",
      brand: "برند",
      "blog-category": "دسته مقالات",
      "blog-tag": "برچسب مقالات",
    }[t] || "مورد"
  );
}
