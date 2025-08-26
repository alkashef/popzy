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
import { listPlayers, getCurrentPlayerId, setCurrentPlayer, createPlayer, loadPlayerConfig, savePlayerConfig, loadPlayerStats, addPlayerSession } from '../services/player.js';
import { bindPlayerUI, showPlayerModal } from '../ui/player.js';
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
  // Player init: ensure there is a selected player or prompt
  bindPlayerUI();
  let playerId = getCurrentPlayerId();
  if (!playerId) {
    const roster = listPlayers();
    if (!roster.length) {
      // Start fresh: require user to create/select
      showPlayerModal();
    } else {
      // Preselect last-used (stored in localStorage)
      setCurrentPlayer(roster[0].id);
      playerId = roster[0].id;
    }
  }

  // Load per-player config if selected
  if (playerId) {
    const cfg = loadPlayerConfig(playerId) || {};
    Object.keys(cfg).forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(state.gameConfig, k)) state.gameConfig[k] = cfg[k];
    });
    // Sync name display and config to roster name
    try {
      const p = listPlayers().find(p => p.id === playerId);
      if (p) {
        state.gameConfig.playerName = p.name;
        savePlayerConfig(playerId, { ...cfg, playerName: p.name });
      }
    } catch {}
  }
  if (state.__pendingTestConfig) {
    Object.assign(state.gameConfig, state.__pendingTestConfig);
  }

  // Load per-player statistics (current player only)
  state.gameStats = playerId ? loadPlayerStats(playerId) : { totals:{}, sessions:[], gameSessionStats: [] };

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
        // Save per-player session and stats
        const curId = getCurrentPlayerId();
        if (curId) {
          state.gameStats = addPlayerSession(curId, session);
        }
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
  // reflect player name (use roster name if available)
  try {
    const pid = getCurrentPlayerId();
    const p = pid ? listPlayers().find(p => p.id === pid) : null;
    setPlayerNameDisplay(p?.name || state.gameConfig.playerName || 'player 1');
  } catch { setPlayerNameDisplay(state.gameConfig.playerName || 'player 1'); }

  // events
  bindEvents();

  // React to player changes: reload config & stats and reflect UI
  try {
    document.addEventListener('player:changed', (ev) => {
      const pid = getCurrentPlayerId();
      if (pid) {
        const cfg = loadPlayerConfig(pid) || {};
        Object.keys(cfg).forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(state.gameConfig, k)) state.gameConfig[k] = cfg[k];
        });
        state.gameStats = loadPlayerStats(pid);
        // Ensure playerName reflects the selected player's roster name
        try {
          const p = listPlayers().find(p => p.id === pid);
          if (p) {
            state.gameConfig.playerName = p.name;
            savePlayerConfig(pid, { ...cfg, playerName: p.name });
            setPlayerNameDisplay(p.name);
          } else {
            setPlayerNameDisplay(state.gameConfig.playerName || 'player 1');
          }
        } catch { setPlayerNameDisplay(state.gameConfig.playerName || 'player 1'); }
        updateSettingsUI(state.gameConfig);
      }
    });
  } catch {}

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
