/** دانلود فایل در مرورگر */

import { showToast } from "@/components/ui/toast";

export function downloadBlobFile(filename, content, mime) {
  try {
    const blob = new Blob([content], { type: mime || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (e) {
    try {
      showToast({
        message: "دانلود ناموفق بود",
        variant: "error",
        duration: 4500,
        position: "top-center",
      });
    } catch (_) {}
    return false;
  }
}
