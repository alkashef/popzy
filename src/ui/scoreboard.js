/**
 * Module: UI/Scoreboard
 * Responsibility:
 * - Update score, timer, and player name displays.
 * - Keep DOM manipulation for scoreboard concerns in one place.
 * API:
 * - setScoreDisplay(number)
 * - setTimerText(string)
 * - setPlayerNameDisplay(string)
 * - resetScoreboard()
 */

import { UI } from './dom.js';

/**
 * Set the numeric score value in the UI.
 * @param {number} score
 */
export function setScoreDisplay(score) {
  const el = UI?.el?.scoreNumber || document.querySelector('.score-number');
  if (el) el.textContent = Number(score) || 0;
}

/**
 * Set the timer text (e.g., 00:00) in the UI.
 * @param {string} text
 */
export function setTimerText(text) {
  const el = UI?.el?.timer || document.getElementById('timer');
  if (el) el.textContent = text || '00:00';
}

/**
 * Set the player name display.
 * @param {string} name
 */
export function setPlayerNameDisplay(name) {
  const el = UI?.el?.playerNameDisplay || document.getElementById('player-name-display');
  if (el) el.textContent = name || 'player 1';
}

/**
 * Reset scoreboard to initial state.
 */
export function resetScoreboard() {
  setScoreDisplay(0);
  setTimerText('00:00');
}
