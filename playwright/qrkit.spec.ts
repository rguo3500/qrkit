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

test('renders authenticated Dynamic QR analytics and empty-state boundaries', async ({ browser }) => {
  test.skip(!process.env.PLAYWRIGHT_STORAGE_STATE, 'Set PLAYWRIGHT_STORAGE_STATE to run authenticated Dynamic QR analytics acceptance');
  const context = await browser.newContext({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
  const page = await context.newPage();
  await page.goto('/dynamic-qr');
  await expect(page.getByRole('heading', { name: /Manage a destination/ })).toBeVisible();
  const empty = page.getByText('No saved links yet.');
  if (await empty.isVisible()) {
    await context.close();
    test.skip(true, 'Authenticated account has no saved Dynamic QR link for analytics acceptance');
  }
  await page.getByRole('button').filter({ hasText: /ACTIVE|PAUSED/ }).first().click();
  await expect(page.getByRole('heading', { name: /Scan analytics/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Recent visits/ })).toBeVisible();
  await expect(page.getByTestId('scan-trend-chart').or(page.getByTestId('scan-empty-state'))).toBeVisible();
  await expect(page.getByTestId('recent-visits').or(page.getByTestId('recent-empty-state'))).toBeVisible();
  await expect(page.getByText(/No scan data yet|Total scans/)).toBeVisible();
  await context.close();
});

test('returns a safe response for an unconfigured Dynamic QR slug on a deployed Worker', async ({ request }) => {
  test.skip(!process.env.PLAYWRIGHT_WORKER_URL, 'Set PLAYWRIGHT_WORKER_URL to run deployed Worker redirect smoke test');
  const response = await request.get(`${process.env.PLAYWRIGHT_WORKER_URL}/r/not-configured-qrkit-test`);
  expect([404, 302]).toContain(response.status());
});

test('blocks high-logo export risk and recovers after safer brand settings', async ({ page }) => {
  await page.goto('/brand-and-batch-qr');
  await expect(page.getByRole('heading', { name: /Make one system/ })).toBeVisible();
  const png = page.getByRole('button', { name: /ZIP \/ PNG/ });
  const svg = page.getByRole('button', { name: /ZIP \/ SVG/ });
  await page.getByLabel('Logo size').selectOption('0.26');
  await expect(page.getByRole('status')).toContainText('Export blocked');
  await expect(png).toBeDisabled();
  await expect(svg).toBeDisabled();
  await page.getByLabel('Logo size').selectOption('0.18');
  await expect(page.getByRole('status')).toContainText('Scan-safe');
  await expect(png).toBeEnabled();
  await expect(svg).toBeEnabled();
});

test('renders the team workspace boundary', async ({ page }) => {
  await page.goto('/teams');
  await expect(page.getByRole('heading', { name: /Share the destination/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your teams' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
});
