/** ساخت و به‌روزرسانی لیست اعلان‌ها (pure) */

export function createNotification(payload = {}, { idPrefix = "n-" } = {}) {
  return {
    id: idPrefix + Date.now() + "-" + Math.random().toString(36).slice(2, 5),
    type: payload.type || "system",
    title: payload.title || "اعلان",
    body: payload.body || "",
    date:
      new Date().toLocaleDateString("fa-IR") +
      " " +
      new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    read: false,
  };
}

export function prependNotification(list, item, max = 60) {
  const base = Array.isArray(list) ? list : [];
  return [item, ...base].slice(0, max);
}

export function markAllNotificationsRead(list) {
  return (list || []).map((n) => ({ ...n, read: true }));
}

export function markNotificationRead(list, id) {
  return (list || []).map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function unreadNotificationCount(list) {
  return (list || []).filter((n) => !n.read).length;
}
