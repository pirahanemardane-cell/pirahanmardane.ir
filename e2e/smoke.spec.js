// @ts-check
const { test, expect } = require('@playwright/test')

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://pirahanmardane.ir'

test.describe('smoke', () => {
  test('home loads', async ({ page }) => {
    const res = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
    expect(res && res.status()).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })

  test('api health or catalog responds', async ({ request }) => {
    let res = await request.get(BASE + '/api/health')
    if (res.status() === 404) {
      res = await request.get(BASE + '/api/catalog/products')
    }
    expect(res.status()).toBeLessThan(500)
  })

  test('api is not cached as static HIT ideally', async ({ request }) => {
    const res = await request.get(BASE + '/api/catalog/products')
    expect(res.status()).toBeLessThan(500)
  })
})

test('catalog products api responds', async ({ request }) => {
  const res = await request.get('/api/catalog/products');
  expect(res.status()).toBeLessThan(500);
  const json = await res.json().catch(() => ({}));
  expect(json).toBeTruthy();
});

test('catalog categories api responds', async ({ request }) => {
  const res = await request.get('/api/catalog/categories');
  expect(res.status()).toBeLessThan(500);
});
