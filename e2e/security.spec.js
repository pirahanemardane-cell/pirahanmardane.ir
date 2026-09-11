// @ts-check
const { test, expect } = require('@playwright/test')

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://pirahanmardane.ir'

test.describe('security — unauthenticated access', () => {
  const adminGets = [
    '/api/admin/sellers',
    '/api/admin/orders',
    '/api/admin/products',
    '/api/admin/stats',
    '/api/admin/reviews',
    '/api/admin/audit',
    '/api/admin/errors',
    '/api/admin/media',
  ]

  for (const path of adminGets) {
    test('GET ' + path + ' blocked without auth', async ({ request }) => {
      const res = await request.get(BASE + path)
      expect([401, 403, 404]).toContain(res.status())
      expect(res.status()).toBeLessThan(500)
    })
  }

  test('POST /api/admin/backup blocked without auth', async ({ request }) => {
    const res = await request.post(BASE + '/api/admin/backup', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect([401, 403, 404, 405]).toContain(res.status())
    expect(res.status()).toBeLessThan(500)
  })

  test('POST /api/orders without auth is blocked', async ({ request }) => {
    const res = await request.post(BASE + '/api/orders', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect([401, 403, 400, 405, 429]).toContain(res.status())
    expect(res.status()).toBeLessThan(500)
  })

  test('OTP request with invalid phone returns 4xx not 5xx', async ({ request }) => {
    const res = await request.post(BASE + '/api/auth/otp/request', {
      data: { phone: '123' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test('OTP verify with empty body returns 4xx not 5xx', async ({ request }) => {
    const res = await request.post(BASE + '/api/auth/otp/verify', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test('login-password with empty body returns 4xx not 5xx', async ({ request }) => {
    const res = await request.post(BASE + '/api/auth/login-password', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})


  test('GET /api/seller/orders without auth is blocked', async ({ request }) => {
    const res = await request.get(BASE + '/api/seller/orders')
    expect([401, 403, 404]).toContain(res.status())
    expect(res.status()).toBeLessThan(500)
  })


  test('GET /api/account/export without auth is blocked', async ({ request }) => {
    const res = await request.get(BASE + '/api/account/export')
    expect([401, 403]).toContain(res.status())
  })

test.describe('security — public APIs shape', () => {
  test('health returns structured payload', async ({ request }) => {
    const res = await request.get(BASE + '/api/health')
    expect(res.status()).toBeLessThan(500)
    const json = await res.json().catch(() => null)
    expect(json).toBeTruthy()
    expect(json.service || json.ok !== undefined).toBeTruthy()
  })

  test('catalog products is public and not 5xx', async ({ request }) => {
    const res = await request.get(BASE + '/api/catalog/products')
    expect(res.status()).toBeLessThan(500)
  })

  test('catalog brands is public and not 5xx', async ({ request }) => {
    const res = await request.get(BASE + '/api/catalog/brands')
    expect([200, 404]).toContain(res.status())
  })
})
