/** کمک‌توابع تیکت/چت — بدون وابستگی به React state */

export function findOpenChatConversation(list) {
  const arr = Array.isArray(list) ? list : [];
  return (
    arr.find((t) => t && (t.fromChat || t.channel === "chat") && t.status !== "closed") ||
    arr.find((t) => t && t.channel === "chat") ||
    null
  );
}

export function conversationChannelLabel(t) {
  if (!t) return "گفتگو";
  if (t.type === "return" || t.channel === "return") return "مرجوعی";
  if (t.fromChat || t.channel === "chat" || t.type === "chat") return "چت";
  return "تیکت";
}

export function ticketMessagesToChatUI(messages) {
  return (messages || []).map((m, i) => ({
    id: m.id || "m-" + i + "-" + (m.time || m.date || ""),
    from: m.from === "buyer" || m.from === "user" ? "user" : "agent",
    text: m.text || "",
    time: m.time || m.date || "",
  }));
}
