// Unit tests for src/services/storage.js addSession logic
const path = require('path');
const { pathToFileURL } = require('url');

async function importStorage() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/services/storage.js')).href);
  return mod;
}

function emptyStats() {
  return { totalHits: 0, totalMisses: 0, totalTargetsPenalized: 0, gameSessionStats: [] };
}

module.exports = {
  'addSession: updates totals and appends session': async () => {
    const { addSession } = await importStorage();
    const s = emptyStats();
    const session = { hits: 2, misses: 1, targetsPenalized: 1 };
    const next = addSession(s, session);
    if (next.totalHits !== 2 || next.totalMisses !== 1 || next.totalTargetsPenalized !== 1) {
      throw new Error('Totals not updated correctly');
    }
    if (next.gameSessionStats.length !== 1) throw new Error('Session not appended');
  },

  'addSession: trims to last 50': async () => {
    const { addSession } = await importStorage();
    let s = emptyStats();
    for (let i = 0; i < 55; i++) {
      s = addSession(s, { hits: 1, misses: 0, targetsPenalized: 0, id: i });
    }
    if (s.gameSessionStats.length !== 50) throw new Error('Should keep last 50 sessions');
    const firstId = s.gameSessionStats[0].id;
    if (firstId !== 5) throw new Error('Expected first remaining id to be 5');
  },
};
