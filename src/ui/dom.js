/**
 * Module: UI/DOM Cache
 * Responsibility:
 * - Centralize querying and caching of DOM elements used by the app.
 * - Provide a single UI.el map to avoid repeated lookups and to decouple
 *   game logic from direct DOM access.
 * API:
 * - UI.el: Record<string, HTMLElement|null> of named elements.
 * - initUIRefs(): populate UI.el; call once during app init.
 */

export const UI = {
  el: {}
};

/**
 * Populate the UI.el cache with references to key DOM elements.
 * Prefer calling once after DOMContentLoaded.
 * @returns {{el: Record<string, HTMLElement|null>}}
 */
export function initUIRefs() {
  const byId = (id) => document.getElementById(id) || null;
  const byQS = (sel) => document.querySelector(sel) || null;

  UI.el = {
    // Canvas and containers
    canvas: byId('gameCanvas'),
    rightPanel: byId('right-panel'),

    // Displays
    playerNameDisplay: byId('player-name-display'),
    scoreNumber: byQS('.score-number'),
    timer: byId('timer'),

    // Control buttons
    playButton: byId('play-button'),
    pauseButton: byId('pause-button'),
    stopButton: byId('stop-button'),

    // Settings
    settingsButton: byId('settings-button'),
    settingsOkButton: byId('settings-ok-button'),
    settingsModal: byId('settings-modal'),

    // Scores
    scoresButton: byId('scores-button'),
    scoresOkButton: byId('scores-ok-button'),
    scoresModal: byId('scores-modal'),
    latestGameRankings: byId('latest-game-rankings'),
    overallStatistics: byId('overall-statistics'),
    topPerformers: byId('top-performers'),
    gameEndHistogram: byId('game-end-histogram'),

    // About
    aboutButton: byId('about-button'),
    aboutOkButton: byId('close-about'),
    aboutModal: byId('about-modal'),

    // Game over overlay
    gameOverOkButton: byId('game-over-ok-button'),
    gameOverOverlay: byId('game-over-overlay'),
    gameOverMessage: byQS('.game-over-message'),
    finalPlayerName: byId('final-player-name'),
    finalScore: byId('final-score'),
    gameStatistics: byId('game-statistics'),

    // Settings controls
    speed: byId('speed'),
    speedValue: byId('speed-value'),
    randomness: byId('randomness'),
    randomnessValue: byId('randomness-value'),
    spawnRate: byId('spawnRate'),
    spawnRateValue: byId('spawnRate-value'),

    objectSize: byId('object-size'),
    objectSizeValue: byId('object-size-value'),
    sizeVariation: byId('size-variation'),
    sizeVariationValue: byId('size-variation-value'),
  volume: byId('volume'),
  volumeValue: byId('volume-value'),
    ratio: byId('ratio'),
    ratioValue: byId('ratio-value'),

    playerName: byId('player-name'),
    targetWords: byId('target-words'),
    friendlyWords: byId('friendly-words'),

    targetColor: byId('target-color'),
    friendlyColor: byId('friendly-color'),
    friendlyMode: byId('friendly-mode'),

    missPenaltyEnabled: byId('miss-penalty-enabled'),

    timeLimitEnabled: byId('time-limit-enabled'),
    timeLimit: byId('time-limit'),
    timeLimitValue: byId('time-limit-value'),

    scoreLimitEnabled: byId('score-limit-enabled'),
    scoreLimit: byId('score-limit'),
    scoreLimitValue: byId('score-limit-value'),

    captionEnabled: byId('caption-enabled'),
    captionDirection: byId('caption-direction'),
    captionMaxTokens: byId('caption-max-tokens'),
    captionMaxTokensValue: byId('caption-max-tokens-value'),
    captionColor: byId('caption-color'),
    captionSize: byId('caption-size'),
    captionSizeValue: byId('caption-size-value'),

    targetTransparency: byId('target-transparency'),
    targetTransparencyValue: byId('target-transparency-value'),
    friendlyTransparency: byId('friendly-transparency'),
    friendlyTransparencyValue: byId('friendly-transparency-value'),
    friendlyImagesTransparency: byId('friendly-images-transparency'),
    friendlyImagesTransparencyValue: byId('friendly-images-transparency-value'),

    showObjectPaths: byId('show-object-paths'),
    objectShadows: byId('object-shadows'),

    backgroundColor: byId('background-color'),
    backgroundImage: byId('background-image'),

    // Preset containers
    targetColorPresets: byId('target-color-presets'),
    friendlyColorPresets: byId('friendly-color-presets'),
    captionColorPresets: byId('caption-color-presets'),
    backgroundColorPresets: byId('background-color-presets'),

    // Misc
    resetSettingsButton: byId('reset-settings-button'),
  };

  return UI;
}
