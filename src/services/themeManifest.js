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
      // Friendly forest palette: warm browns and sunny ochres
      btnBg: '#ffffff',
      btnBgHover: '#f3f3f3',
      btnBgActive: '#e6e6e6',
      btnText: '#8B4513',
      modalBg: '#f3e5ab',
      modalText: '#8B4513',
      controlBg: '#ffffff',
      controlTrackBg: '#ffffff',
      surface: 'rgba(255,255,255,0.06)',
      surfaceStrong: 'rgba(255,255,255,0.10)',
      surfaceBorder: 'rgba(139,69,19,0.35)',
      scoreColor: '#8B4513'
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
    ui: {
      // Bold lava palette: oranges/reds with high contrast
      modalBg: 'linear-gradient(135deg, #ffb74d 0%, #ff7043 100%)',
      modalText: '#3b0b0b',
      btnBg: '#ff7043',
      btnBgHover: '#ff8a65',
      btnBgActive: '#ff5722',
      btnText: '#1a0a07',
      controlBg: '#fff7f0',
      controlTrackBg: '#ffe0cc',
      surface: 'rgba(255, 140, 102, 0.12)',
      surfaceStrong: 'rgba(255, 140, 102, 0.18)',
      surfaceBorder: 'rgba(255, 112, 67, 0.45)',
      scoreColor: '#ffb300'
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
    ui: {
      // Airy sky palette: soft blues and friendly whites
      modalBg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      modalText: '#0a1a3a',
      btnBg: '#90caf9',
      btnBgHover: '#64b5f6',
      btnBgActive: '#42a5f5',
      btnText: '#06203a',
      controlBg: '#ffffff',
      controlTrackBg: '#e3f2fd',
      surface: 'rgba(187, 222, 251, 0.18)',
      surfaceStrong: 'rgba(144, 202, 249, 0.24)',
      surfaceBorder: 'rgba(66, 165, 245, 0.45)',
      scoreColor: '#0d47a1'
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
