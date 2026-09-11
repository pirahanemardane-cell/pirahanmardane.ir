/** اسکرول مطمئن به بالای صفحه (موبایل/سافاری) */

export function scrollPageToTop() {
  const go = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (_) {
      try {
        window.scrollTo(0, 0);
      } catch (__) {}
    }
    try {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      const root =
        document.getElementById("__next") ||
        document.getElementById("root") ||
        document.scrollingElement;
      if (root) root.scrollTop = 0;
      document.querySelectorAll("[data-scroll-root], main, .panel-content-wrap").forEach((el) => {
        try {
          el.scrollTop = 0;
        } catch (_) {}
      });
    } catch (_) {}
  };
  go();
  try {
    requestAnimationFrame(() => {
      go();
      requestAnimationFrame(go);
    });
  } catch (_) {}
  try {
    setTimeout(go, 0);
  } catch (_) {}
  try {
    setTimeout(go, 50);
  } catch (_) {}
  try {
    setTimeout(go, 120);
  } catch (_) {}
  try {
    setTimeout(go, 280);
  } catch (_) {}
  try {
    setTimeout(go, 500);
  } catch (_) {}
}
