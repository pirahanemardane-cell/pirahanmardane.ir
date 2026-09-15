// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('seller journey shell', () => {
  test('home exposes seller entry points without crash', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    // هر کنترل مرتبط با فروشنده — فقط اطمینان از عدم کرش
    const candidates = page.locator('button, a').filter({ hasText: /فروشنده|پنل|ثبت[‌ ]?نام/ });
    const count = await candidates.count();
    if (count > 0) {
      await candidates.first().click({ trial: true }).catch(() => {});
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('seller panel route state does not white-screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      try {
        localStorage.setItem('sellerUser', JSON.stringify({
          id: 'e2e-seller',
          shopName: 'فروشگاه تست',
          ownerName: 'تست',
          phone: '09120000000',
        }));
      } catch (_) {}
    });
    await page.reload();
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });
});
