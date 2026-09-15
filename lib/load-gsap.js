/** Lazy GSAP bundle — keeps initial App chunk smaller for faster first paint. */
let gsapBundlePromise = null;

export function loadGsap() {
  if (!gsapBundlePromise) {
    gsapBundlePromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([gsapMod, stMod]) => {
      const gsap = gsapMod.default;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return gsapBundlePromise;
}
