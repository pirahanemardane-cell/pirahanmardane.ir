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


/** POST /api/auth/otp/request */
export async function requestOtp(phone) {
  const res = await fetch("/api/auth/otp/request", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

/** POST /api/auth/logout — best-effort */
export function postLogout() {
  return fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
}


/** POST /api/auth/otp/verify
 * @param {string} phone
 * @param {string} code
 * @param {'buyer'|'seller'} role
 */
export async function verifyOtpApi(phone, code, role = "buyer") {
  const res = await fetch("/api/auth/otp/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, role }),
  });
  return res.json();
}


/** POST /api/auth/login-password
 * Returns JSON body; if HTTP not ok, forces { ok: false }.
 */
export async function loginWithPasswordApi(phone, password, remember = false) {
  const res = await fetch("/api/auth/login-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone, password, remember: !!remember }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ...data, ok: false, error: data?.error || "ورود ناموفق" };
  }
  return data;
}
