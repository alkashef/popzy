/**
 * Game controls (start, pause, resume, stop) and helpers
 */
import { state, resetScore } from './state.js';
import { UI } from '../ui/dom.js';
import { getRightPanelWidth } from '../ui/canvas.js';
import { clearCaption } from '../ui/caption.js';
import { setScoreDisplay, setTimerText, setPlayerNameDisplay } from '../ui/scoreboard.js';
import { hideGameOver } from '../ui/overlay.js';
import { playSound as playAudio } from '../services/audio.js';

export function playSound(key) {
  playAudio(state.sounds, key);
}

export function getEndReasonText(reason) {
  switch (reason) {
    case 'friendly_shot':
      return 'Friendly picture shot';
    case 'score_negative':
      return 'Score dropped below 0';
    case 'time_limit':
      return 'Time limit reached';
    case 'score_limit':
      return 'Score limit for game end';
    case 'stop_button':
    case 'manual':
      return 'Game stopped manually';
    default:
      return 'Unknown reason';
  }
}

export function getEndReasonMessage(reason) {
  switch (reason) {
    case 'friendly_shot':
      return "Don't shoot the friendly images!";
    case 'score_negative':
      return 'Score went negative! Try to hit more targets.';
    case 'time_limit': {
      const mins = Math.floor((state.gameConfig.timeLimit || 0) / 60);
      return mins > 0
        ? `Time's up! You played for ${mins} minute${mins === 1 ? '' : 's'}.`
        : "Time's up!";
    }
    case 'score_limit':
      return `Congratulations! You reached the target score of ${state.gameConfig.scoreLimit}!`;
    case 'stop_button':
    case 'manual':
      return 'Game stopped.';
    default:
      return 'Game over.';
  }
}

export function dismissGameOverOverlay() {
  hideGameOver();
  state.gameStarted = false;
  state.gamePaused = false;
  resetScore();
  setScoreDisplay(state.score);
  setTimerText('00:00');
  setPlayerNameDisplay(state.gameConfig.playerName || 'player 1');
  const pauseButton = UI?.el?.pauseButton || document.getElementById('pause-button');
  if (pauseButton) pauseButton.title = 'Pause';
}

export function startGame() {
  if (state.gameStarted && state.gamePaused) {
    resumeGame();
    return;
  }
  state.gameStarted = true;
  state.gamePaused = false;
  playSound('gameStart');
  resetScore();
  state.currentGameEndReason = '';
  clearCaption(state.gameConfig);
  setScoreDisplay(state.score);
  setTimerText('00:00');
  setPlayerNameDisplay(state.gameConfig.playerName || 'player 1');
  // ensure canvas is sized relative to right panel
  const rightPanelWidth = getRightPanelWidth();
  state.canvas.width = window.innerWidth - rightPanelWidth;
  state.canvas.height = window.innerHeight;
  state.engine?.start();
}

export function pauseGame() {
  if (!state.gameStarted || state.gamePaused) return;
  state.gamePaused = true;
  state.engine?.pause();
}

export function resumeGame() {
  if (!state.gameStarted || !state.gamePaused) return;
  state.gamePaused = false;
  state.engine?.resume();
}

export function stopGame(endReason = 'manual') {
  if (!state.gameStarted) return;
  playSound('gameOver');
  state.engine?.stop(endReason);
}
