const { test, expect } = require('@playwright/test');

// Basic smoke test covering start, click, and an end condition

test.describe('Shoot the Unicorn - Smoke', () => {
  test('start game, click a few times, and reach an end state', async ({ page }) => {
    await page.goto('/');

    // Ensure canvas and controls are present
    const playButton = page.locator('#play-button');
    const pauseButton = page.locator('#pause-button');
    const stopButton = page.locator('#stop-button');
    const canvas = page.locator('#gameCanvas');

    await expect(playButton).toBeVisible();
    await expect(canvas).toBeVisible();

    // Start the game
    await playButton.click();

    // Click on the canvas a few times to simulate gameplay
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas bounding box not available');

    for (let i = 0; i < 5; i++) {
      const x = box.x + box.width * (0.2 + 0.6 * Math.random());
      const y = box.y + box.height * (0.2 + 0.6 * Math.random());
      await page.mouse.click(x, y);
      await page.waitForTimeout(200);
    }

    // Pause and resume
    await pauseButton.click();
    await page.waitForTimeout(300);
    await playButton.click(); // resume

    // Stop the game to trigger game over overlay
    await stopButton.click();

    const overlay = page.locator('#game-over-overlay');
    await expect(overlay).toBeVisible();

    // Dismiss overlay
    const okBtn = page.locator('#game-over-ok-button');
    await okBtn.click();
    await expect(overlay).toBeHidden();
  });
});
