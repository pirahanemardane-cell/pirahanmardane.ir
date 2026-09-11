/** تولید کد یکتای تیکت TK + 9 رقم */

export function generateTicketCode(extraLists = []) {
  const collect = () => {
    const codes = new Set();
    const add = (arr) => {
      (arr || []).forEach((t) => {
        if (t && t.code) codes.add(String(t.code));
        if (t && t.id) codes.add(String(t.id));
      });
    };
    try {
      add(JSON.parse(localStorage.getItem("buyerTickets") || "[]"));
    } catch (_) {}
    try {
      add(JSON.parse(localStorage.getItem("sellerTickets") || "[]"));
    } catch (_) {}
    try {
      add(JSON.parse(localStorage.getItem("adminTickets") || "[]"));
    } catch (_) {}
    (extraLists || []).forEach(add);
    return codes;
  };
  const existing = collect();
  for (let i = 0; i < 40; i++) {
    let digits = "";
    for (let j = 0; j < 9; j++) digits += String(Math.floor(Math.random() * 10));
    const code = "TK" + digits;
    if (!existing.has(code)) return code;
  }
  return "TK" + String(Date.now()).slice(-9);
}
