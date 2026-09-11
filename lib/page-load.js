/** لودینگ بین صفحات */

import { PAGE_LOAD_LABELS } from "@/lib/app-constants";
import { scrollPageToTop } from "@/lib/scroll-page-to-top";

export function pageLoadMessage(key) {
  return (
    PAGE_LOAD_LABELS[key] ||
    (key ? "در حال بارگذاری " + key + "…" : "در حال بارگذاری…")
  );
}

export function runBeginPageScroll() {
  try {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  } catch (_) {}
  try {
    if (typeof scrollPageToTop === "function") scrollPageToTop();
  } catch (_) {}
}
