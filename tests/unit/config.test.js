const path = require('path');
const { pathToFileURL } = require('url');

async function importConfig() {
  const mod = await import(pathToFileURL(path.resolve(__dirname, '../../src/core/config.js')).href);
  return mod;
}

module.exports = {
  'createDefaultGameConfig: has expected defaults': async () => {
    const { createDefaultGameConfig, GAME_CONFIG_DEFAULTS } = await importConfig();
    const cfg = createDefaultGameConfig();
    if (cfg.speed !== GAME_CONFIG_DEFAULTS.DEFAULT_SPEED) throw new Error('speed');
    if (cfg.randomness !== GAME_CONFIG_DEFAULTS.DEFAULT_RANDOMNESS) throw new Error('randomness');
    if (cfg.spawnRate !== GAME_CONFIG_DEFAULTS.DEFAULT_SPAWN_RATE) throw new Error('spawnRate');
    if (cfg.missPenaltyEnabled !== GAME_CONFIG_DEFAULTS.DEFAULT_MISS_PENALTY_ENABLED) throw new Error('missPenaltyEnabled');
    if (cfg.timeLimit !== GAME_CONFIG_DEFAULTS.DEFAULT_TIME_LIMIT) throw new Error('timeLimit');
    if (cfg.scoreLimit !== GAME_CONFIG_DEFAULTS.DEFAULT_SCORE_LIMIT) throw new Error('scoreLimit');
  },
};
