const { test, expect } = require('@playwright/test');

test('end by score goes below zero', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#play-button', { state: 'visible' });

  // Configure to make score drop quickly on missed targets
  await page.evaluate(() => {
    window.__shootTest?.setConfig({
      timeLimitEnabled: false,
      missPenaltyEnabled: true,
      spawnRate: 120, // many objects
      speed: 2.0,
      randomness: 0.2,
      ratio: 1.0, // all targets
      objectSize: 14,
    });
  });

  // Start game
  await page.evaluate(() => window.__shootTest?.start());

  // Click empty canvas areas to accumulate misses while targets fly off
  const canvas = page.locator('#gameCanvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box not available');

  for (let i = 0; i < 30; i++) {
    // Click edges to likely miss objects
    const x = i % 2 === 0 ? box.x + 5 : box.x + box.width - 5;
    const y = (i % 3) * (box.height / 3) + box.y + 10;
    await page.mouse.click(x, y);
    await page.waitForTimeout(50);
  }

  // Wait for engine to stop with score_negative (up to 8s)
  await expect.poll(async () => (
    await page.evaluate(() => window.__shootTest?.getState()?.endReason)
  ), { timeout: 8000, intervals: [250, 250, 500, 1000, 1000, 1000, 1000] }).toBe('score_negative');
});
