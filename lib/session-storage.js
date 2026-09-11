/** خواندن/نوشتن سشن کاربر در localStorage */

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ۳۰ روز

export function readSessionUser(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && u.sessionExpires && Date.now() > u.sessionExpires) {
      localStorage.removeItem(key);
      return null;
    }
    return u;
  } catch {
    return null;
  }
}

export function writeSessionUser(key, user, ttlMs = SESSION_TTL_MS) {
  try {
    const payload = {
      ...user,
      sessionExpires: Date.now() + (ttlMs || SESSION_TTL_MS),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

export function clearSessionUser(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}
