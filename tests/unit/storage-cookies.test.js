const path = require('path');
const { pathToFileURL } = require('url');

async function importStorage() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/storage.js')).href);
  return mod;
}

module.exports = {
  'storage cookies: save/load/delete config': async () => {
    const { saveConfig, loadConfig, deleteConfig } = await importStorage();
    global.document = { cookie: '' };
    saveConfig({ a: 1 });
    const loaded = loadConfig();
    if (!loaded || loaded.a !== 1) throw new Error('config load failed');
    deleteConfig();
    if (document.cookie.includes('shootTheUnicornConfig=')) throw new Error('config cookie not deleted');
  },
  'storage cookies: save/load/delete stats': async () => {
    const { saveStats, loadStats, deleteStats } = await importStorage();
    global.document = { cookie: '' };
    const base = { totalHits: 1, totalMisses: 2, totalTargetsPenalized: 3, gameSessionStats: [{score:1}] };
    saveStats(base);
    const loaded = loadStats();
    if (loaded.totalHits !== 1 || loaded.totalMisses !== 2 || loaded.totalTargetsPenalized !== 3 || loaded.gameSessionStats.length !== 1) {
      throw new Error('stats load failed');
    }
    deleteStats();
    if (document.cookie.includes('shootTheUnicornGameStats=')) throw new Error('stats cookie not deleted');
  },
};
