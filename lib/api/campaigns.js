/** Campaigns */
export async function fetchCampaigns(all = false) {
  const res = await fetch("/api/campaigns" + (all ? "?all=1" : ""), {
    credentials: "include",
    cache: "no-store",
  });
  return res.json().catch(() => ({}));
}
export async function saveCampaign(item, method = "POST") {
  const res = await fetch("/api/campaigns", {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(item),
  });
  return res.json().catch(() => ({}));
}
