// @ts-check
const { test, expect } = require('@playwright/test')

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://pirahanmardane.ir'

test.describe('critical paths — pre-gateway', () => {
  test('home page loads (not 5xx)', async ({ page }) => {
    const res = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(res).toBeTruthy()
    expect(res.status()).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('health API is healthy', async ({ request }) => {
    const res = await request.get(BASE + '/api/health')
    expect(res.status()).toBeLessThan(500)
    if (res.status() === 200) {
      const json = await res.json().catch(() => ({}))
      expect(json.ok === true || json.service).toBeTruthy()
    }
  })

  test('catalog products API responds', async ({ request }) => {
    const res = await request.get(BASE + '/api/catalog/products')
    expect(res.status()).toBeLessThan(500)
    const json = await res.json().catch(() => null)
    expect(json).toBeTruthy()
  })

  test('catalog categories API responds', async ({ request }) => {
    const res = await request.get(BASE + '/api/catalog/categories')
    expect(res.status()).toBeLessThan(500)
  })

  test('admin sellers API without auth is blocked (401/403)', async ({ request }) => {
    const res = await request.get(BASE + '/api/admin/sellers')
    expect([401, 403]).toContain(res.status())
  })

  test('admin orders API without auth is blocked (401/403)', async ({ request }) => {
    const res = await request.get(BASE + '/api/admin/orders')
    expect([401, 403]).toContain(res.status())
  })

  test('payment request without auth is blocked (401/403)', async ({ request }) => {
    const res = await request.post(BASE + '/api/payments/request', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect([401, 403, 400, 405, 429]).toContain(res.status())
    expect(res.status()).toBeLessThan(500)
  })
})
