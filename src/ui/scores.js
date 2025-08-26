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
import { getCurrentPlayerId, loadPlayerStats, computeAggregates, listPlayers } from '../services/player.js';

/**
 * Populate the scores dashboard sections from gameStats.
 * @param {{ gameSessionStats: Array<any> }} gameStats
 * @param {(reason: string) => string} getEndReasonText
 */
export function renderScoresDashboard(gameStats, getEndReasonText) {
  // Prefer current player's stats if available
  try {
    const id = getCurrentPlayerId();
    if (id) gameStats = loadPlayerStats(id);
  } catch {}
  const sessions = gameStats?.sessions || gameStats?.gameSessionStats || [];
  const latestGame = sessions[sessions.length - 1];

  // Player name banner (top center)
  const nameBanner = document.getElementById('scores-player-name');
  if (nameBanner) {
    let displayName = latestGame?.playerName || 'player 1';
    try {
      const curId = getCurrentPlayerId();
      if (curId) {
        const p = listPlayers().find(p => p.id === curId);
        if (p?.name) displayName = p.name;
      }
    } catch {}
    nameBanner.textContent = displayName;
  }

  // Player summary (aggregates)
  const summaryEl = UI?.el?.playerSummary || document.getElementById('player-summary');
  // Last Game (mirror game over stats)
  const lastGameEl = document.getElementById('last-game');
  if (lastGameEl) {
    if (!latestGame) lastGameEl.innerHTML = '<div class="stat-item">No games played yet</div>';
    else {
      const acc = typeof latestGame.accuracy === 'number' ? latestGame.accuracy : 0;
      lastGameEl.innerHTML = `
        <div class="stat-item"><span class="stat-label">Total Hits:</span><span class="stat-value">${latestGame.hits || 0}</span></div>
        <div class="stat-item"><span class="stat-label">Total Clicks:</span><span class="stat-value">${latestGame.clicks || 0}</span></div>
        <div class="stat-item"><span class="stat-label">Accuracy:</span><span class="stat-value">${acc.toFixed(1)}%</span></div>
        <div class="stat-item"><span class="stat-label">Total Targets Missed:</span><span class="stat-value">${latestGame.targetsPenalized || 0}</span></div>
        <div class="stat-item"><span class="stat-label">Total Hits Missed:</span><span class="stat-value">${latestGame.misses || 0}</span></div>
        <div class="stat-item"><span class="stat-label">Game End Reason:</span><span class="stat-value">${getEndReasonText(latestGame.gameEndReason || 'unknown')}</span></div>
      `;
    }
  }
  if (summaryEl) {
    if (!sessions.length) summaryEl.innerHTML = '<div class="stat-item">No games played yet</div>';
    else {
      const agg = computeAggregates(gameStats);
      summaryEl.innerHTML = `
        <div class="stat-item"><span class="stat-label">Sessions:</span><span class="stat-value">${agg.sessionsCount}</span></div>
        <div class="stat-item"><span class="stat-label">Avg Score:</span><span class="stat-value">${agg.averageScore.toFixed(1)}</span></div>
        <div class="stat-item"><span class="stat-label">Avg Rate:</span><span class="stat-value">${agg.averageRate.toFixed(2)} hits/min</span></div>
        <div class="stat-item"><span class="stat-label">Avg Accuracy:</span><span class="stat-value">${agg.averageAccuracy.toFixed(1)}%</span></div>
        <div class="stat-item"><span class="stat-label">Avg Time:</span><span class="stat-value">${Math.round(agg.averagePlayTimeSec)}s</span></div>
        <div class="stat-item"><span class="stat-label">Total Time:</span><span class="stat-value">${Math.round(agg.totalPlayTimeSec)}s</span></div>
        <div class="stat-item"><span class="stat-label">Most Common End:</span><span class="stat-value">${getEndReasonText(agg.modeEndReason)}</span></div>
      `;
    }
  }

  // Overall Statistics (legacy section kept for tests/back-compat)
  const overallStatsElement = UI?.el?.overallStatistics || document.getElementById('overall-statistics');
  if (overallStatsElement) {
    const totalClicks = sessions.reduce((sum, g) => sum + (g.clicks || 0), 0);
    const totalHits = sessions.reduce((sum, g) => sum + (g.hits || 0), 0);
    const overallAccuracy = totalClicks > 0 ? (totalHits / totalClicks) * 100 : 0;
    const uniquePlayers = new Set(sessions.map(g => g.playerName)).size;
    overallStatsElement.innerHTML = `
      <div class="stat-item"><span class="stat-label">Total Games:</span><span class="stat-value">${sessions.length}</span></div>
      <div class="stat-item"><span class="stat-label">Unique Players:</span><span class="stat-value">${uniquePlayers}</span></div>
      <div class="stat-item"><span class="stat-label">Overall Accuracy:</span><span class="stat-value">${overallAccuracy.toFixed(1)}%</span></div>
      <div class="stat-item"><span class="stat-label">Total Clicks:</span><span class="stat-value">${totalClicks}</span></div>
    `;
  }

  // Top Performers (legacy section kept for tests/back-compat)
  const topPerformersElement = UI?.el?.topPerformers || document.getElementById('top-performers');
  if (topPerformersElement) {
    const highestScore = sessions.length > 0 ? Math.max(...sessions.map(g => g.score || 0)) : 0;
    const highestScoreGame = sessions.find(g => (g.score || 0) === highestScore);
    const highestRate = sessions.length > 0 ? Math.max(...sessions.map(g => g.averageHitRate || 0)) : 0;
    const highestRateGame = sessions.find(g => (g.averageHitRate || 0) === highestRate);
    const highestAccuracy = sessions.length > 0 ? Math.max(...sessions.map(g => g.accuracy || 0)) : 0;
    const highestAccuracyGame = sessions.find(g => (g.accuracy || 0) === highestAccuracy);
    topPerformersElement.innerHTML = `
      <div class="stat-item"><span class="stat-label">Highest Score:</span><span class="stat-value">${highestScoreGame ? `${highestScore} (${highestScoreGame.playerName})` : 'N/A'}</span></div>
      <div class="stat-item"><span class="stat-label">Highest Rate:</span><span class="stat-value">${highestRateGame ? `${highestRate} hits/min (${highestRateGame.playerName})` : 'N/A'}</span></div>
      <div class="stat-item"><span class="stat-label">Highest Accuracy:</span><span class="stat-value">${highestAccuracyGame ? `${highestAccuracy.toFixed(1)}% (${highestAccuracyGame.playerName})` : 'N/A'}</span></div>
    `;
  }

  // Latest Game Rankings removed from UI; keep stub for legacy tests if element exists
  const latestRankingsElement = UI?.el?.latestGameRankings || document.getElementById('latest-game-rankings');
  if (latestRankingsElement) {
    latestRankingsElement.innerHTML = '<div class="rank-item">Rankings have moved.</div>';
  }

  // Last Games table
  const sessionsEl = UI?.el?.sessionsList || document.getElementById('sessions-list');
  if (sessionsEl) {
    if (!sessions.length) {
      sessionsEl.innerHTML = '<div class="stat-item">No games</div>';
    } else {
      // Sort by timestamp if present, fallback to original order
      const sorted = sessions.slice().sort((a,b)=>{
        const ta = Date.parse(a.gameEndTime || '') || 0;
        const tb = Date.parse(b.gameEndTime || '') || 0;
        return tb - ta; // newest first
      });
      const header = `
        <table class="scores-table" role="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Score</th>
              <th><div class="th-label">Rate</div><div class="th-unit">hits/min</div></th>
              <th>Accuracy</th>
              <th><div class="th-label">Duration</div><div class="th-unit">sec</div></th>
              <th>Game End</th>
            </tr>
          </thead>
          <tbody>
      `;
      const rows = sorted.map(g => `
        <tr>
          <td>${g.gameEndTime ? new Date(g.gameEndTime).toLocaleString() : ''}</td>
          <td>${g.score ?? ''}</td>
          <td>${g.averageHitRate ?? ''}</td>
          <td>${typeof g.accuracy === 'number' ? g.accuracy.toFixed(1) + '%' : ''}</td>
          <td>${g.gameDurationSeconds ?? ''}</td>
          <td>${getEndReasonText(g.gameEndReason || 'unknown')}</td>
        </tr>
      `).join('');
      sessionsEl.innerHTML = header + rows + '</tbody></table>';
    }
  }

  // (end legacy Top Performers block)

  // Game End Reasons Histogram (list all reasons, even if zero)
  const histogramElement = UI?.el?.gameEndHistogram || document.getElementById('game-end-histogram');
  if (histogramElement) {
    const allReasons = ['friendly_shot','score_negative','time_limit','score_limit','manual','unknown'];
    const endReasons = allReasons.reduce((m, r) => (m[r]=0, m), {});
    sessions.forEach((game) => {
      const reason = game.gameEndReason || 'unknown';
      endReasons[reason] = (endReasons[reason] || 0) + 1;
    });

    const values = Object.values(endReasons);
    const maxCount = values.length ? Math.max(...values) : 0;
    let histogramHTML = '';

    allReasons.forEach((reason) => {
      const count = endReasons[reason] || 0;
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
