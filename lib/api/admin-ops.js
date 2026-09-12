/** Admin ops: server backup + error logs */
export async function downloadServerBackup() {
  const res = await fetch('/api/admin/backup', { credentials: 'include', cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  return { res, json }
}

export async function restoreServerBackup(backup) {
  const res = await fetch('/api/admin/backup', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ backup }),
  })
  return res.json().catch(() => ({}))
}

export async function fetchAdminErrors(limit = 50) {
  const res = await fetch('/api/admin/errors?limit=' + encodeURIComponent(String(limit)), {
    credentials: 'include',
    cache: 'no-store',
  })
  return res.json().catch(() => ({}))
}
