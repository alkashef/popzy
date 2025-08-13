/**
 * Default asset manifests used by the game in a static browser environment.
 * These lists are data-driven to avoid hard-coding inside the game logic.
 */

// Image file lists (filenames only). Base paths are provided at load time.
export const imageFiles = {
  target: [
    // No target images yet; renderer draws targets as circles.
  ],
  friendly: [
    'unicorn_02.png',
    'unicorn_03.png',
    'unicorn_256.png',
  ],
};

// Sound file map (key -> filename). Base path is provided at load time.
export const soundFiles = {
  gameStart: 'game-start.mp3',
  gameOver: 'game-over.mp3',
  oww: 'oww.mp3',
  cymbal: 'cymbal.mp3',
  snare: 'snare.mp3',
};
