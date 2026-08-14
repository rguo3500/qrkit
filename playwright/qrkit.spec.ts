import { test, expect } from '@playwright/test';


test('downloads a generated PNG and SVG from the URL QR tool', async ({ page }) => {
  await page.goto('/url-to-qr-code');
  await expect(page.getByRole('heading', { name: 'URL QR Code' })).toBeVisible();
  const input = page.locator('input').first();
  await input.fill('https://example.com/playwright');
  const png = page.getByRole('button', { name: /PNG/ });
  const svg = page.getByRole('button', { name: /SVG/ });
  const pngDownload = page.waitForEvent('download');
  await png.click();
  expect((await pngDownload).suggestedFilename()).toBe('url-qr-code.png');
  const svgDownload = page.waitForEvent('download');
  await svg.click();
  expect((await svgDownload).suggestedFilename()).toBe('url-qr-code.svg');
});

test('shows the authenticated Dynamic QR workspace boundary', async ({ page }) => {
  await page.goto('/dynamic-qr');
  await expect(page.getByRole('heading', { name: /Manage a destination/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign in to save/ })).toBeVisible();
});

test('returns a safe response for an unconfigured Dynamic QR slug on a deployed Worker', async ({ request }) => {
  test.skip(!process.env.PLAYWRIGHT_WORKER_URL, 'Set PLAYWRIGHT_WORKER_URL to run deployed Worker redirect smoke test');
  const response = await request.get(`${process.env.PLAYWRIGHT_WORKER_URL}/r/not-configured-qrkit-test`);
  expect([404, 302]).toContain(response.status());
});
