/** منطق خالص لایک و کامنت بلاگ — بدون React/toast */

export function isBlogLiked(likedBlogs, blogId) {
  return (Array.isArray(likedBlogs) ? likedBlogs : []).some(
    (b) => String(b.id) === String(blogId)
  );
}

/** برمی‌گرداند: { next, action: 'added' | 'removed' | null } */
export function toggleBlogLikeList(likedBlogs, blogId) {
  if (!blogId) return { next: Array.isArray(likedBlogs) ? likedBlogs : [], action: null };
  const prev = Array.isArray(likedBlogs) ? likedBlogs : [];
  const exists = prev.some((b) => String(b.id) === String(blogId));
  if (exists) {
    return {
      next: prev.filter((b) => String(b.id) !== String(blogId)),
      action: "removed",
    };
  }
  return {
    next: [{ id: blogId, likedAt: Date.now() }, ...prev],
    action: "added",
  };
}

export function buildBlogCommentEntry({ name, body, bodyHtml, now = Date.now() }) {
  const safeName = String(name || "کاربر").slice(0, 40);
  const safeText = String(body || "").slice(0, 500);
  const safeHtml = String(bodyHtml || "").slice(0, 2000);
  let date;
  try {
    date = new Date(now).toLocaleDateString("fa-IR");
  } catch (_) {
    date = "";
  }
  return {
    id: `c${now}`,
    name: safeName,
    text: safeText,
    html: safeHtml,
    date,
  };
}

export function appendBlogComment(commentsMap, blogId, entry) {
  const prev = commentsMap && typeof commentsMap === "object" ? commentsMap : {};
  const list = Array.isArray(prev[blogId]) ? prev[blogId] : [];
  return { ...prev, [blogId]: [entry, ...list] };
}
