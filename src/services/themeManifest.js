/**
 * Theme manifest: declarative definitions of available themes.
 * Each theme provides colors, transparencies, optional background image, and sound paths.
 */

export const THEMES = {
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Greens and nature vibes.',
    colors: {
      targetColor: '#2ecc71',
      friendlyColor: '#27ae60',
      captionColor: '#e8f5e9',
      backgroundColor: '#0b3d0b',
      transparency: { target: 0.9, friendly: 0.8, friendlyImages: 0.8 },
    },
    ui: {
      btnBg: '#ffffff',               // buttons background white
      btnBgHover: '#f3f3f3',
      btnBgActive: '#e6e6e6',
      btnText: '#8B4513',             // brown text
      modalBg: '#f3e5ab',             // light pale ochre yellow
  modalText: '#8B4513',           // brown text in modals
    },
    assets: {
      background: 'assets/themes/forest/backgrounds/main',
      cursor: 'assets/themes/forest/cursors/cursor.png',
      sounds: {
        gameStart: 'assets/themes/forest/sounds/game-start.mp3',
        gameOver: 'assets/themes/forest/sounds/game-over.mp3',
        obstacleHit: 'assets/themes/forest/sounds/obstacle-hit.mp3',
        friendlyHit: 'assets/themes/forest/sounds/friendly-hit.mp3',
        targetHit: 'assets/themes/forest/sounds/target-hit.mp3',
      },
    },
  background: { imageUrl: 'assets/themes/forest/backgrounds/main', imageFit: 'cover' },
  },
  volcano: {
    id: 'volcano',
    name: 'Volcano',
    description: 'Hot lava reds and deep rumbles.',
    colors: {
      targetColor: '#ff5722',
      friendlyColor: '#ff9800',
      captionColor: '#ffe0b2',
      backgroundColor: '#2b0b0b',
      transparency: { target: 0.9, friendly: 0.85, friendlyImages: 0.8 },
    },
    assets: {
      background: 'assets/themes/volcano/backgrounds/main',
      cursor: 'assets/themes/volcano/cursors/cursor.png',
      sounds: {
        gameStart: 'assets/themes/volcano/sounds/game-start.mp3',
        gameOver: 'assets/themes/volcano/sounds/game-over.mp3',
        obstacleHit: 'assets/themes/volcano/sounds/obstacle-hit.mp3',
        friendlyHit: 'assets/themes/volcano/sounds/friendly-hit.mp3',
        targetHit: 'assets/themes/volcano/sounds/target-hit.mp3',
      },
    },
  background: { imageUrl: 'assets/themes/volcano/backgrounds/main', imageFit: 'cover' },
  },
  skies: {
    id: 'skies',
    name: 'Skies',
    description: 'Blues, clouds, and airy sounds.',
    colors: {
      targetColor: '#03a9f4',
      friendlyColor: '#81d4fa',
      captionColor: '#e0f7fa',
      backgroundColor: '#0a1a3a',
      transparency: { target: 0.8, friendly: 0.8, friendlyImages: 0.7 },
    },
    assets: {
      background: 'assets/themes/skies/backgrounds/main',
      cursor: 'assets/themes/skies/cursors/cursor.png',
      sounds: {
        gameStart: 'assets/themes/skies/sounds/game-start.mp3',
        gameOver: 'assets/themes/skies/sounds/game-over.mp3',
        obstacleHit: 'assets/themes/skies/sounds/obstacle-hit.mp3',
        friendlyHit: 'assets/themes/skies/sounds/friendly-hit.mp3',
        targetHit: 'assets/themes/skies/sounds/target-hit.mp3',
      },
    },
  background: { imageUrl: 'assets/themes/skies/backgrounds/main', imageFit: 'cover' },
  },
};

export function listThemes() {
  return Object.values(THEMES);
}

export function getThemeById(id) {
  return THEMES[id] || null;
}
