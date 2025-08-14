/**
 * Module: App/Events
 * Responsibility:
 * - Bind all DOM events to control/game logic once during init.
 * - Pause/resume around modal openings (Settings/Scores) preserving prior state.
 * - Relay canvas clicks to engine pointer handling.
 */
import { UI } from '../ui/dom.js';
import { openSettings, closeSettings } from '../ui/settings.js';
import { openScores, closeScores } from '../ui/scores.js';
import { initAbout, openAbout, closeAbout } from '../ui/about.js';
import { state } from './state.js';
import { startGame, pauseGame, stopGame, getEndReasonText, dismissGameOverOverlay } from './controls.js';
import { updateSettingsUI, bindSettingsControls } from '../ui/settings.js';
import { resetConfigToDefaults } from './settingsActions.js';

let wasGameRunningBeforeSettings = false;
let wasGameRunningBeforeScores = false;

export function bindEvents() {
  // Play
  const playButton = UI?.el?.playButton || document.getElementById('play-button');
  playButton?.addEventListener('click', () => startGame());

  // Pause
  const pauseButton = UI?.el?.pauseButton || document.getElementById('pause-button');
  pauseButton?.addEventListener('click', () => pauseGame());

  // Stop
  const stopButton = UI?.el?.stopButton || document.getElementById('stop-button');
  stopButton?.addEventListener('click', () => stopGame('stop_button'));

  // Settings open/close
  const settingsButton = UI?.el?.settingsButton || document.getElementById('settings-button');
  settingsButton?.addEventListener('click', () => {
    wasGameRunningBeforeSettings = state.gameStarted && !state.gamePaused;
    if (state.gameStarted && !state.gamePaused) pauseGame();
    openSettings();
  });

  const settingsOkButton = UI?.el?.settingsOkButton || document.getElementById('settings-ok-button');
  settingsOkButton?.addEventListener('click', () => {
    closeSettings();
    if (wasGameRunningBeforeSettings && state.gameStarted && state.gamePaused) {
      // resume through control API
      const evt = new Event('resume-request');
      document.dispatchEvent(evt);
    }
    wasGameRunningBeforeSettings = false;
  });

  const settingsModal = UI?.el?.settingsModal || document.getElementById('settings-modal');
  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettings();
    }
  });
  const resetSettingsButton = UI?.el?.resetSettingsButton || document.getElementById('reset-settings-button');
  resetSettingsButton?.addEventListener('click', () => {
    resetConfigToDefaults();
  });

  // Scores open/close
  const scoresButton = UI?.el?.scoresButton || document.getElementById('scores-button');
  scoresButton?.addEventListener('click', () => {
    wasGameRunningBeforeScores = state.gameStarted && !state.gamePaused;
    if (state.gameStarted && !state.gamePaused) pauseGame();
    openScores(state.gameStats, getEndReasonText);
  });

  const scoresOkButton = UI?.el?.scoresOkButton || document.getElementById('scores-ok-button');
  scoresOkButton?.addEventListener('click', () => {
    closeScores();
    if (wasGameRunningBeforeScores && state.gameStarted && state.gamePaused) {
      const evt = new Event('resume-request');
      document.dispatchEvent(evt);
    }
    wasGameRunningBeforeScores = false;
  });

  const scoresModal = UI?.el?.scoresModal || document.getElementById('scores-modal');
  scoresModal?.addEventListener('click', (e) => {
    if (e.target === scoresModal) {
      closeScores();
    }
  });

  // About init/open/close
  initAbout();
  const aboutButton = UI?.el?.aboutButton || document.getElementById('about-button');
  aboutButton?.addEventListener('click', () => openAbout());
  const aboutOkButton = UI?.el?.aboutOkButton || document.getElementById('close-about');
  aboutOkButton?.addEventListener('click', () => closeAbout());

  // Canvas click -> engine pointer
  state.canvas.addEventListener('click', (event) => {
    if (!state.gameStarted) return;
    const rect = state.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    state.engine?.handlePointer(clickX, clickY);
  });

  // Resume requests from modal closures
  document.addEventListener('resume-request', () => {
    if (state.gameStarted && state.gamePaused) state.engine?.resume();
  });

  // Game Over OK button
  const gameOverOkButton = UI?.el?.gameOverOkButton || document.getElementById('game-over-ok-button');
  gameOverOkButton?.addEventListener('click', () => dismissGameOverOverlay());
}
