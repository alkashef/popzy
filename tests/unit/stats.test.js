// Unit tests for src/services/stats.js using the minimal runner API
const path = require('path');
const { pathToFileURL } = require('url');

async function importStats() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/stats.js')).href);
  return mod;
}

function mockStats(games) {
  return {
    gameSessionStats: games,
  };
}

module.exports = {
  'rank calculators: empty dataset returns rank 0 (not found)': async () => {
    const { calculateRateRank, calculateScoreRank, calculateAccuracyRank } = await importStats();
    const stats = mockStats([]);
    const r = calculateRateRank(stats, 0);
    const s = calculateScoreRank(stats, 0);
    const a = calculateAccuracyRank(stats, 0);
    if (r !== 0 || s !== 0 || a !== 0) throw new Error('Expected rank 0 for empty dataset');
  },

  'rank calculators: proper ranking order': async () => {
    const { calculateRateRank, calculateScoreRank, calculateAccuracyRank } = await importStats();
    const stats = mockStats([
      { averageHitRate: 1, score: 5, accuracy: 50 },
      { averageHitRate: 2, score: 10, accuracy: 75 },
      { averageHitRate: 3, score: 3, accuracy: 25 },
    ]);
    if (calculateRateRank(stats, 2) !== 2) throw new Error('Rate rank incorrect');
    if (calculateScoreRank(stats, 5) !== 2) throw new Error('Score rank incorrect');
    if (calculateAccuracyRank(stats, 25) !== 3) throw new Error('Accuracy rank incorrect');
  },
};
