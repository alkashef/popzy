const path = require('path');
const { pathToFileURL } = require('url');

async function importScores() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/scores.js')).href);
  return mod;
}
async function importUI() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/dom.js')).href);
  return mod;
}

module.exports = {
  'scores: render populated dashboard': async () => {
  // Ensure no stale UI.el cache from other tests
  const { UI } = await importUI();
  UI.el = {};
    const { renderScoresDashboard } = await importScores();
    const nodes = {
      'latest-game-rankings': { innerHTML: '' },
      'overall-statistics': { innerHTML: '' },
      'top-performers': { innerHTML: '' },
      'game-end-histogram': { innerHTML: '' },
    };
    global.document = {
      getElementById: (id) => nodes[id] || null,
    };
    const stats = { gameSessionStats: [
      { playerName: 'A', averageHitRate: 1, score: 5, accuracy: 50, clicks: 10, hits: 5, gameEndReason: 'time_limit' },
      { playerName: 'B', averageHitRate: 2, score: 10, accuracy: 75, clicks: 12, hits: 9, gameEndReason: 'score_limit' },
      { playerName: 'C', averageHitRate: 3, score: 3, accuracy: 25, clicks: 8, hits: 2, gameEndReason: 'friendly_shot' },
    ]};
    renderScoresDashboard(stats, (r) => r);
    if (!nodes['latest-game-rankings'].innerHTML) throw new Error('latest not rendered');
    if (!nodes['overall-statistics'].innerHTML) throw new Error('overall not rendered');
    if (!nodes['top-performers'].innerHTML) throw new Error('top not rendered');
    if (!nodes['game-end-histogram'].innerHTML) throw new Error('histogram not rendered');
  },
};
