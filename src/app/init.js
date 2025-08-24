/**
 * Module: App/Init
 * Responsibility:
 * - Orchestrate application startup: load config & stats, cache DOM, init canvas,
 *   load assets, construct engine with hooks, wire settings/events, and render idle.
 * - Apply any pending test config and pending test start set by early test hooks.
 */
import { state, setCanvas } from './state.js';
import { initUIRefs } from '../ui/dom.js';
import { initCanvas } from '../ui/canvas.js';
import { loadAllAssets } from './assets.js';
import { renderFrame, preloadBackgroundImage, initBackgrounds } from '../render/draw.js';
import { createGameEngine } from '../systems/engine.js';
import { addWordToCaption } from '../ui/caption.js';
import { setScoreDisplay, setTimerText, setPlayerNameDisplay } from '../ui/scoreboard.js';
import { updateSettingsUI, bindSettingsControls } from '../ui/settings.js';
import { showGameOver } from '../ui/overlay.js';
import { bindEvents } from './events.js';
import { loadConfig as storageLoadConfig, loadStats as storageLoadStats, addSession as storageAddSession, saveStats as storageSaveStats } from '../services/storage.js';
import { playSound, getEndReasonMessage, getEndReasonText, startGame } from './controls.js';
import { ensureBackgroundAudio, setGlobalVolume, playBackground, pauseBackground, resolveAudioSrc, hasAudioExt } from '../services/audio.js';
// Theme system removed

/**
 * Initialize the game application. Safe to call after DOM is ready and
 * HTML partials are included. Idempotent in practice for a single-page load.
 */
export async function initApp() {
  // Discover available backgrounds and preload one image immediately
  initBackgrounds();
  preloadBackgroundImage();
  // Load config first
  const savedConfig = storageLoadConfig();
  if (savedConfig) {
    Object.keys(savedConfig).forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(state.gameConfig, k)) {
        state.gameConfig[k] = savedConfig[k];
      }
    });
  // Theme sound pack removed
  }
  if (state.__pendingTestConfig) {
    Object.assign(state.gameConfig, state.__pendingTestConfig);
  }

  // Load statistics
  state.gameStats = storageLoadStats();

  // DOM & canvas
  initUIRefs();
  const { canvas, ctx } = initCanvas();
  setCanvas(canvas, ctx);

  // assets
  await loadAllAssets();

  // No theme to apply; visuals come from CSS variables and Visual settings

  // engine
  state.engine = createGameEngine({
    canvas: state.canvas,
    ctx: state.ctx,
    gameConfig: state.gameConfig,
    renderFrame,
    assets: { friendlyImages: state.friendlyImages },
    hooks: {
      onScoreChange: (newScore) => {
        state.score = newScore;
        setScoreDisplay(state.score);
      },
      onTimerUpdate: (text) => setTimerText(text),
      onAddCaptionWord: (word) => addWordToCaption(word, state.gameConfig),
      onPlaySound: (key) => playSound(key),
      onStop: (reason, session) => {
        state.currentGameEndReason = reason;
        state.gameStats = storageAddSession(state.gameStats, session);
        try { storageSaveStats(state.gameStats); } catch {}
        showGameOver({
          playerName: state.gameConfig.playerName || 'player 1',
          score: session.score,
          message: getEndReasonMessage(reason),
          reasonText: getEndReasonText(reason),
          session,
        });
        state.gameStarted = false;
        state.gamePaused = false;
  pauseBackground();
        setPlayerNameDisplay(state.gameConfig.playerName || 'player 1');
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) pauseButton.title = 'Pause';
      },
    },
  });

  // apply settings to UI
  updateSettingsUI(state.gameConfig);
  bindSettingsControls(state.gameConfig);

  // events
  bindEvents();

  // initial idle render
  renderFrame(state.ctx, state.canvas, state.gameConfig, [], false);

  // audio: setup background track and volume
  try {
    const bgBase = 'background';
    const bgResolved = hasAudioExt(bgBase) ? `assets/sounds/${bgBase}` : await resolveAudioSrc('assets/sounds/', bgBase);
    ensureBackgroundAudio(bgResolved);
    setGlobalVolume(state.sounds, state.gameConfig.volume);
  } catch {}

  // react to volume changes from settings
  try {
    document.addEventListener('audio:volume', (ev) => {
      const v = ev?.detail?.volume;
      setGlobalVolume(state.sounds, v);
    });
  } catch {}

  // honor pending test start
  if (state.__pendingTestStart) {
    state.__pendingTestStart = false;
    startGame();
  }
}
