const path = require('path');
const { pathToFileURL } = require('url');

async function importStats() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/stats.js')).href);
  return mod;
}

module.exports = {
  'rank calculators: handle duplicates and missing accuracy': async () => {
    const { calculateRateRank, calculateScoreRank, calculateAccuracyRank } = await importStats();
    const stats = { gameSessionStats: [
      { averageHitRate: 5, score: 10, accuracy: 80 },
      { averageHitRate: 5, score: 7 },
      { averageHitRate: 3, score: 10, accuracy: 0 },
    ]};
    if (calculateRateRank(stats, 5) !== 1) throw new Error('duplicate rate rank should be 1');
    if (calculateScoreRank(stats, 10) !== 1) throw new Error('duplicate score rank should be 1');
    if (calculateAccuracyRank(stats, 0) !== 3) throw new Error('missing accuracy treated as 0 and ranked');
  },
};
