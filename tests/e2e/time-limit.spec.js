const { test, expect } = require('@playwright/test');

test('end by time limit', async ({ page }) => {
  await page.goto('/');

  // Wait for app to initialize (controls visible)
  await page.waitForSelector('#play-button', { state: 'visible' });
  // Use a deterministic test hook to enable a very short time limit
  await page.evaluate(() => window.__shootTest?.setTimeLimit(2));

  // Start game via test hook
  await page.evaluate(() => window.__shootTest?.start());

  // Wait for end reason to become time_limit (up to 6s)
  await expect.poll(async () => (
    await page.evaluate(() => window.__shootTest?.getState()?.endReason)
  ), { timeout: 6000, intervals: [250, 250, 500, 1000, 1000, 1000, 1000] }).toBe('time_limit');

  // Dismiss overlay
  const overlay = page.locator('#game-over-overlay');
  await overlay.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
  const okBtn = page.locator('#game-over-ok-button');
  if (await overlay.isVisible({ timeout: 100 })) {
    await okBtn.click();
    await expect(overlay).toBeHidden();
  }
  // Sanity-check end reason
  const endReason = await page.evaluate(() => window.__shootTest?.getState()?.endReason);
  expect(endReason).toBe('time_limit');
});
