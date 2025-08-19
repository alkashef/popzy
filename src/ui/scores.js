/**
 * Module: UI/Scores Dashboard
 * Responsibility:
 * - Render and control the Scores modal (latest game, overall stats, top performers, histogram).
 * API:
 * - openScores(gameStats, getEndReasonText)
 * - closeScores()
 * - renderScoresDashboard(gameStats, getEndReasonText)
 */

import { UI } from './dom.js';
import { calculateRateRank, calculateScoreRank, calculateAccuracyRank } from '../services/stats.js';

/**
 * Populate the scores dashboard sections from gameStats.
 * @param {{ gameSessionStats: Array<any> }} gameStats
 * @param {(reason: string) => string} getEndReasonText
 */
export function renderScoresDashboard(gameStats, getEndReasonText) {
  const latestGame = gameStats.gameSessionStats[gameStats.gameSessionStats.length - 1];

  // Latest Game Rankings
  const latestRankingsElement = UI?.el?.latestGameRankings || document.getElementById('latest-game-rankings');
  if (latestRankingsElement) {
    if (latestGame) {
      const rateRank = calculateRateRank(gameStats, latestGame.averageHitRate);
      const scoreRank = calculateScoreRank(gameStats, latestGame.score);
      const accuracyRank = calculateAccuracyRank(gameStats, latestGame.accuracy || 0);

    latestRankingsElement.innerHTML = `
      <div class="rank-item">
        <strong>Score Rank:</strong> ${scoreRank} of ${gameStats.gameSessionStats.length} games<br>
        <span class="rank-secondary">Score: ${latestGame.score}</span>
      </div>
      <div class="rank-item">
        <strong>Rate Rank:</strong> ${rateRank} of ${gameStats.gameSessionStats.length} games<br>
        <span class="rank-secondary">Rate: ${latestGame.averageHitRate} hits/min</span>
      </div>
      <div class="rank-item">
        <strong>Accuracy Rank:</strong> ${accuracyRank} of ${gameStats.gameSessionStats.length} games<br>
        <span class="rank-secondary">Accuracy: ${(latestGame.accuracy || 0).toFixed(1)}%</span>
      </div>
    `;
    } else {
      latestRankingsElement.innerHTML = '<div class="rank-item">No games played yet</div>';
    }
  }

  // Overall Statistics
  const overallStatsElement = UI?.el?.overallStatistics || document.getElementById('overall-statistics');
  if (overallStatsElement) {
    const uniquePlayers = new Set(gameStats.gameSessionStats.map((game) => game.playerName)).size;
    const totalClicks = gameStats.gameSessionStats.reduce((sum, game) => sum + (game.clicks || 0), 0);
    const totalHits = gameStats.gameSessionStats.reduce((sum, game) => sum + (game.hits || 0), 0);
    const overallAccuracy = totalClicks > 0 ? (totalHits / totalClicks) * 100 : 0;

    overallStatsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Games:</span>
                <span class="stat-value">${gameStats.gameSessionStats.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Unique Players:</span>
                <span class="stat-value">${uniquePlayers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Overall Accuracy:</span>
                <span class="stat-value">${overallAccuracy.toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Clicks:</span>
                <span class="stat-value">${totalClicks}</span>
            </div>
        `;
  }

  // Top Performers
  const topPerformersElement = UI?.el?.topPerformers || document.getElementById('top-performers');
  if (topPerformersElement) {
    const highestScore = gameStats.gameSessionStats.length > 0 ? Math.max(...gameStats.gameSessionStats.map((game) => game.score)) : 0;
    const highestScoreGame = gameStats.gameSessionStats.find((game) => game.score === highestScore);

    const highestRate = gameStats.gameSessionStats.length > 0 ? Math.max(...gameStats.gameSessionStats.map((game) => game.averageHitRate)) : 0;
    const highestRateGame = gameStats.gameSessionStats.find((game) => game.averageHitRate === highestRate);

    const highestAccuracy = gameStats.gameSessionStats.length > 0 ? Math.max(...gameStats.gameSessionStats.map((game) => game.accuracy || 0)) : 0;
    const highestAccuracyGame = gameStats.gameSessionStats.find((game) => (game.accuracy || 0) === highestAccuracy);

    topPerformersElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Highest Score:</span>
                <span class="stat-value">${highestScoreGame ? `${highestScore} (${highestScoreGame.playerName})` : 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Highest Rate:</span>
                <span class="stat-value">${highestRateGame ? `${highestRate} hits/min (${highestRateGame.playerName})` : 'N/A'}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Highest Accuracy:</span>
                <span class="stat-value">${highestAccuracyGame ? `${highestAccuracy.toFixed(1)}% (${highestAccuracyGame.playerName})` : 'N/A'}</span>
            </div>
        `;
  }

  // Game End Reasons Histogram
  const histogramElement = UI?.el?.gameEndHistogram || document.getElementById('game-end-histogram');
  if (histogramElement) {
    const endReasons = {};
    gameStats.gameSessionStats.forEach((game) => {
      const reason = game.gameEndReason || 'unknown';
      endReasons[reason] = (endReasons[reason] || 0) + 1;
    });

    const values = Object.values(endReasons);
    const maxCount = values.length ? Math.max(...values) : 0;
    let histogramHTML = '';

    Object.entries(endReasons).forEach(([reason, count]) => {
      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
      histogramHTML += `
                <div class="histogram-bar">
                    <div class="histogram-label">${getEndReasonText(reason)}</div>
                    <div class="histogram-visual">
                        <div class="histogram-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="histogram-count">${count}</div>
                </div>
            `;
    });

    histogramElement.innerHTML = histogramHTML || '<div class="stat-item">No games completed yet</div>';
  }
}

/**
 * Open the Scores modal and render its contents.
 * @param {{ gameSessionStats: Array<any> }} gameStats
 * @param {(reason: string) => string} getEndReasonText
 */
export function openScores(gameStats, getEndReasonText) {
  renderScoresDashboard(gameStats, getEndReasonText);
  const scoresModal = UI?.el?.scoresModal || document.getElementById('scores-modal');
  if (scoresModal) scoresModal.classList.remove('hidden');
}

export function closeScores() {
  const scoresModal = UI?.el?.scoresModal || document.getElementById('scores-modal');
  if (scoresModal) scoresModal.classList.add('hidden');
}
