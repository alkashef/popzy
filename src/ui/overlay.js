/**
 * Module: UI/Game Over Overlay
 * Responsibility:
 * - Show/hide the game over overlay and populate its content.
 * API:
 * - showGameOver({ playerName, score, message, reasonText, session })
 * - hideGameOver()
 */

import { UI } from './dom.js';

/**
 * Show and populate the game over overlay.
 * @param {{
 *  playerName: string,
 *  score: number,
 *  message: string,
 *  reasonText?: string,
 *  session?: {
 *    hits?: number,
 *    clicks?: number,
 *    accuracy?: number,
 *    targetsPenalized?: number,
 *    misses?: number,
 *  }
 * }} params
 */
export function showGameOver({ playerName, score, message, reasonText, session = {} }) {
  const overlay = UI?.el?.gameOverOverlay || document.getElementById('game-over-overlay');
  if (!overlay) return;

  const finalPlayerName = UI?.el?.finalPlayerName || document.getElementById('final-player-name');
  const finalScore = UI?.el?.finalScore || document.getElementById('final-score');
  const msg = UI?.el?.gameOverMessage || document.querySelector('.game-over-message');
  const stats = UI?.el?.gameStatistics || document.getElementById('game-statistics');

  overlay.classList.remove('hidden');
  if (finalPlayerName) finalPlayerName.textContent = playerName || 'player 1';
  if (finalScore) finalScore.textContent = `Score: ${Number(score) || 0}`;
  if (msg) msg.textContent = message || '';

  if (stats) {
    const acc = typeof session.accuracy === 'number' ? session.accuracy : 0;
    const reason = reasonText || '';
    stats.innerHTML = `
      <div><strong>Total Hits:</strong> ${session.hits || 0}</div>
      <div><strong>Total Clicks:</strong> ${session.clicks || 0}</div>
      <div><strong>Accuracy:</strong> ${acc.toFixed(1)}%</div>
      <div><strong>Total Targets Missed:</strong> ${session.targetsPenalized || 0}</div>
      <div><strong>Total Hits Missed:</strong> ${session.misses || 0}</div>
      <div><strong>Game End Reason:</strong> ${reason}</div>
    `;
  }
}

/** Hide the game over overlay */
export function hideGameOver() {
  const overlay = UI?.el?.gameOverOverlay || document.getElementById('game-over-overlay');
  if (overlay) overlay.classList.add('hidden');
  const msg = UI?.el?.gameOverMessage || document.querySelector('.game-over-message');
  if (msg) msg.textContent = '';
}
