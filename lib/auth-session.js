/** Clear client auth session keys — extracted from App (قدم ۷۱) */

const AUTH_KEYS = ["buyerUser", "sellerUser", "adminUser", "pm_remember", "user"];

export function clearAuthLocal() {
  try {
    AUTH_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
      try {
        sessionStorage.removeItem(k);
      } catch (_) {}
    });
  } catch (_) {}
  try {
    sessionStorage.removeItem("pm_panel");
  } catch (_) {}
  try {
    sessionStorage.removeItem("pm_admin_ok");
  } catch (_) {}
  try {
    sessionStorage.removeItem("adminTab");
  } catch (_) {}
  try {
    if (typeof window !== "undefined") {
      try {
        delete window.__pmAuthPassword;
      } catch (_) {}
      try {
        delete window.__pmAuthRemember;
      } catch (_) {}
    }
  } catch (_) {}
}
