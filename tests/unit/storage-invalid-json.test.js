const path = require('path');
const { pathToFileURL } = require('url');

async function importStorage() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/storage.js')).href);
  return mod;
}

module.exports = {
  'storage: invalid JSON returns defaults/null safely': async () => {
    const { loadConfig, loadStats } = await importStorage();
    global.document = { cookie: 'shootTheUnicornConfig={oops}; shootTheUnicornGameStats={broken}' };
    const cfg = loadConfig();
    const stats = loadStats();
    if (cfg !== null) throw new Error('invalid config should return null');
    if (!stats || !Array.isArray(stats.gameSessionStats)) throw new Error('invalid stats should return defaults');
  },
};
