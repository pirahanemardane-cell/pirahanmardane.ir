// @ts-check
const { test, expect } = require('@playwright/test')

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://pirahanmardane.ir'

test.describe('critical paths', () => {
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
})
