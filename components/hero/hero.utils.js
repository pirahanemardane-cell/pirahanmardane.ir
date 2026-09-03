/* ============================================================================
 * ⛔ HERO FIRST-LOAD LOCK — دست‌نخورده بماند
 * ----------------------------------------------------------------------------
 * قفل اسکرول تا لود کامل هیرو (lockScroll / unlockScroll / heroReady / gate)
 * و منطق «اول لود کامل بعد باز شدن اسکرول» بخشی از رفتار قطعی محصول است.
 *
 * قانون برای هر عامل / توسعه‌دهنده / AI:
 *   تا وقتی کاربر صریحاً دستور ندهد، این بلوک را تغییر نده، حذف نکن،
 *   دور نزن، و شرط heroReady را شل نکن.
 * ============================================================================ */

export function isTouchOrMobile() {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const narrow = window.matchMedia('(max-width: 1024px)').matches;
  const touchPoints = navigator.maxTouchPoints > 0;
  return coarse || noHover || touchPoints || narrow;
}

export function lockScroll() {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.touchAction = 'none';
}

export function unlockScroll() {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = '';
  body.style.overflow = '';
  body.style.touchAction = '';
}
