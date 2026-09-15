/** اعمال قالب Markdown روی متن انتخاب‌شده در textarea */

export function applyMarkdownFormat(val, start, end, type) {
  const text = String(val || "");
  const s = Math.max(0, Number(start) || 0);
  const e = Math.max(s, Number(end) || 0);
  const selected = text.slice(s, e);
  let next = text;
  let caret = e;

  const wrap = (before, after = before) => {
    const body = selected || "متن";
    next = text.slice(0, s) + before + body + after + text.slice(e);
    caret = s + before.length + body.length + after.length;
  };

  if (type === "bold") wrap("**", "**");
  else if (type === "italic") wrap("*", "*");
  else if (type === "h2") {
    const body = selected || "عنوان بخش";
    const line = `## ${body}`;
    next = text.slice(0, s) + (s > 0 && text[s - 1] !== "\n" ? "\n" : "") + line + "\n" + text.slice(e);
    caret = s + line.length + 2;
  } else if (type === "ul") {
    const lines = (selected || "مورد")
      .split("\n")
      .map((l) => (l.trim() ? (l.startsWith("• ") ? l : `• ${l}`) : "• "));
    next = text.slice(0, s) + lines.join("\n") + text.slice(e);
    caret = s + lines.join("\n").length;
  } else if (type === "ol") {
    const lines = (selected || "مورد")
      .split("\n")
      .map((l, i) => (l.trim() ? `${i + 1}. ${l.replace(/^\d+\.\s*/, "")}` : `${i + 1}. `));
    next = text.slice(0, s) + lines.join("\n") + text.slice(e);
    caret = s + lines.join("\n").length;
  } else if (type === "quote") {
    const body = selected || "نکته";
    next = text.slice(0, s) + `> ${body}` + text.slice(e);
    caret = s + body.length + 2;
  } else if (type === "hr") {
    next = text.slice(0, s) + "\n———\n" + text.slice(e);
    caret = s + 5;
  }

  return { next, caret };
}
