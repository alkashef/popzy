const { test, expect } = require('@playwright/test');

test('end by unicorn (friendly image) shot', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#play-button', { state: 'visible' });

  // Configure to spawn only friendlies as images, many spawns, larger size
  await page.evaluate(() => {
    window.__shootTest?.setConfig({
      timeLimitEnabled: false,
      ratio: 0.0, // all friendlies
      friendlyMode: 'images',
      spawnRate: 90,
      objectSize: 30,
      randomness: 0.1,
      speed: 1.2,
    });
  });

  await page.evaluate(() => window.__shootTest?.start());

  // Repeatedly try to click the first friendly until game ends
  await expect.poll(async () => {
    const clicked = await page.evaluate(() => window.__shootTest?.clickFirstFriendly());
    return await page.evaluate(() => window.__shootTest?.getState()?.endReason) || (clicked ? 'clicked' : '');
  }, { timeout: 7000, intervals: [200, 200, 300, 400, 500, 1000, 1000, 1000] }).toBe('friendly_shot');
});
