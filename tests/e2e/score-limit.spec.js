const { test, expect } = require('@playwright/test');

test('end by score limit reached', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#play-button', { state: 'visible' });

  // Configure to spawn only targets, large objects, moderate speed; low score limit
  await page.evaluate(() => {
    window.__shootTest?.setConfig({
      timeLimitEnabled: false,
      scoreLimitEnabled: true,
      scoreLimit: 5,
      ratio: 1.0, // all targets
      spawnRate: 80,
      objectSize: 36,
      randomness: 0.1,
      speed: 1.2,
    });
  });

  await page.evaluate(() => window.__shootTest?.start());

  // Keep hitting targets until score_limit
  await expect.poll(async () => {
    // click target if available
    await page.evaluate(() => window.__shootTest?.clickFirstTarget());
    return await page.evaluate(() => window.__shootTest?.getState()?.endReason);
  }, { timeout: 8000, intervals: [150, 150, 250, 400, 600, 800, 1000, 1000] }).toBe('score_limit');
});
