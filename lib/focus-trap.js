/**
 * Focus trap سبک برای مودال / مگامنو — بدون وابستگی
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  );
}

/**
 * @param {HTMLElement} container
 * @returns {() => void} cleanup
 */
export function attachFocusTrap(container) {
  if (!container || typeof document === 'undefined') return () => {};

  const previouslyFocused = document.activeElement;

  const focusFirst = () => {
    const list = getFocusable(container);
    if (list.length) {
      try {
        list[0].focus();
      } catch (_) {}
    } else {
      try {
        container.setAttribute('tabindex', '-1');
        container.focus();
      } catch (_) {}
    }
  };

  // تأخیر کوتاه تا DOM مودال سوار شود
  const t = window.setTimeout(focusFirst, 30);

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const list = getFocusable(container);
    if (!list.length) {
      e.preventDefault();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first || !container.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last || !container.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeyDown);

  return () => {
    window.clearTimeout(t);
    container.removeEventListener('keydown', onKeyDown);
    try {
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    } catch (_) {}
  };
}
