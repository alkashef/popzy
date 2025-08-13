// Unit tests for small UI helpers in settings/scores modules
const path = require('path');
const { pathToFileURL } = require('url');

async function importSettings() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/settings.js')).href);
  return mod;
}
async function importScores() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/ui/scores.js')).href);
  return mod;
}

module.exports = {
  'formatSeconds: formats mm:ss correctly': async () => {
    const { formatSeconds } = await importSettings();
    if (formatSeconds(0) !== '0:00') throw new Error('0 should be 0:00');
    if (formatSeconds(59) !== '0:59') throw new Error('59 should be 0:59');
    if (formatSeconds(60) !== '1:00') throw new Error('60 should be 1:00');
    if (formatSeconds(125) !== '2:05') throw new Error('125 should be 2:05');
  },

  'renderScoresDashboard: handles empty stats safely': async () => {
    const { renderScoresDashboard } = await importScores();
    // Create minimal DOM targets
    const containerIds = ['latest-game-rankings', 'overall-statistics', 'top-performers', 'game-end-histogram'];
    global.document = {
      getElementById: (id) => ({ id, innerHTML: '' }),
      querySelector: () => null,
    };
    global.window = {};
    const stats = { gameSessionStats: [] };
    // Should not throw
    renderScoresDashboard(stats, () => '');
  },
};
